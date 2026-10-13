#!/usr/bin/env bash
# STAFF ONLY. Creates everything the cohort needs inside ONE resource group,
# so that deleting the resource group (teardown.sh) removes all of it.
#
# Per student it creates:
#   - a Container App  notes-<student_id>  capped at one small replica
#   - a managed identity that only that student's GitHub repository can use,
#     with Contributor rights on that one Container App and nothing else
#   - (optional) Reader on the resource group for the student's own account,
#     so they can look at their app in the portal but change nothing by hand
#
# Usage:
#   az login
#   az account set --subscription "<subscription>"
#   INITIAL_IMAGE=ghcr.io/<you>/notes-devops:<tag> ./provision.sh students.csv
#
# Requires Owner (or Contributor plus User Access Administrator) on the
# resource group, because it creates role assignments.
set -euo pipefail

CSV="${1:?Usage: provision.sh students.csv}"
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-acca7023-notes}"
LOCATION="${LOCATION:-uksouth}"
ENVIRONMENT="${ENVIRONMENT:-cae-acca7023}"
WORKSPACE="${WORKSPACE:-log-acca7023}"
# Must be a public image that listens on port 3000, for example the
# reference build of this repository. Students replace it on first deploy.
INITIAL_IMAGE="${INITIAL_IMAGE:?Set INITIAL_IMAGE to a public image listening on port 3000}"

az extension add --name containerapp --upgrade --only-show-errors

echo "Resource group ${RESOURCE_GROUP} in ${LOCATION}"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" \
  --tags module=ACCA7023 purpose=teaching --output none

az monitor log-analytics workspace create \
  --resource-group "$RESOURCE_GROUP" --workspace-name "$WORKSPACE" \
  --retention-time 30 --output none
WORKSPACE_ID=$(az monitor log-analytics workspace show \
  --resource-group "$RESOURCE_GROUP" --workspace-name "$WORKSPACE" \
  --query customerId --output tsv)
WORKSPACE_KEY=$(az monitor log-analytics workspace get-shared-keys \
  --resource-group "$RESOURCE_GROUP" --workspace-name "$WORKSPACE" \
  --query primarySharedKey --output tsv)

az containerapp env create \
  --name "$ENVIRONMENT" --resource-group "$RESOURCE_GROUP" --location "$LOCATION" \
  --logs-workspace-id "$WORKSPACE_ID" --logs-workspace-key "$WORKSPACE_KEY" \
  --output none

TENANT_ID=$(az account show --query tenantId --output tsv)
SUBSCRIPTION_ID=$(az account show --query id --output tsv)
OUTPUT="student-settings.csv"
echo "student_id,AZURE_CLIENT_ID,AZURE_TENANT_ID,AZURE_SUBSCRIPTION_ID,AZURE_RESOURCE_GROUP,AZURE_CONTAINER_APP,url" > "$OUTPUT"

tail -n +2 "$CSV" | tr -d '\r' | while IFS=, read -r STUDENT_ID GITHUB_REPO AZURE_UPN; do
  [ -z "$STUDENT_ID" ] && continue
  APP="notes-${STUDENT_ID}"
  IDENTITY="id-notes-${STUDENT_ID}"
  echo "Student ${STUDENT_ID}: ${APP} <- ${GITHUB_REPO}"

  # Multiple revision mode keeps old revisions available for rollback.
  # min 0 / max 1 replicas: scales to zero when idle and can never fan out.
  az containerapp create \
    --name "$APP" --resource-group "$RESOURCE_GROUP" --environment "$ENVIRONMENT" \
    --image "$INITIAL_IMAGE" --ingress external --target-port 3000 \
    --revisions-mode multiple --min-replicas 0 --max-replicas 1 \
    --cpu 0.25 --memory 0.5Gi \
    --tags module=ACCA7023 student="$STUDENT_ID" --output none
  APP_ID=$(az containerapp show --name "$APP" --resource-group "$RESOURCE_GROUP" --query id --output tsv)
  FQDN=$(az containerapp show --name "$APP" --resource-group "$RESOURCE_GROUP" \
    --query properties.configuration.ingress.fqdn --output tsv)

  # The identity lives in the resource group, so it is deleted with it.
  az identity create --name "$IDENTITY" --resource-group "$RESOURCE_GROUP" --output none
  CLIENT_ID=$(az identity show --name "$IDENTITY" --resource-group "$RESOURCE_GROUP" --query clientId --output tsv)
  PRINCIPAL_ID=$(az identity show --name "$IDENTITY" --resource-group "$RESOURCE_GROUP" --query principalId --output tsv)

  # Only workflows on the main branch of this one repository may use it.
  az identity federated-credential create \
    --name github-main --identity-name "$IDENTITY" --resource-group "$RESOURCE_GROUP" \
    --issuer https://token.actions.githubusercontent.com \
    --subject "repo:${GITHUB_REPO}:ref:refs/heads/main" \
    --audiences api://AzureADTokenExchange --output none

  az role assignment create --assignee-object-id "$PRINCIPAL_ID" \
    --assignee-principal-type ServicePrincipal \
    --role Contributor --scope "$APP_ID" --output none

  if [ -n "${AZURE_UPN:-}" ]; then
    RG_ID=$(az group show --name "$RESOURCE_GROUP" --query id --output tsv)
    az role assignment create --assignee "$AZURE_UPN" \
      --role Reader --scope "$RG_ID" --output none || echo "  could not assign Reader to ${AZURE_UPN}"
  fi

  echo "${STUDENT_ID},${CLIENT_ID},${TENANT_ID},${SUBSCRIPTION_ID},${RESOURCE_GROUP},${APP},https://${FQDN}" >> "$OUTPUT"
done

echo "Done. Hand each student their row from ${OUTPUT}. None of the values are secrets."
