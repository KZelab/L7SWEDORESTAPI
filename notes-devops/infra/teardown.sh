#!/usr/bin/env bash
# STAFF ONLY. Deletes the whole resource group: every Container App, the
# environment, the logs and every deployment identity. This cannot be undone.
set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-rg-acca7023-notes}"

echo "Resources that will be deleted from ${RESOURCE_GROUP}:"
az resource list --resource-group "$RESOURCE_GROUP" --query "[].{name:name, type:type}" --output table

read -r -p "Type the resource group name to confirm deletion: " CONFIRM
if [ "$CONFIRM" != "$RESOURCE_GROUP" ]; then
  echo "Names did not match. Nothing was deleted."
  exit 1
fi

az group delete --name "$RESOURCE_GROUP" --yes --no-wait
echo "Deletion started. Check with: az group exists --name ${RESOURCE_GROUP}"
