# Azure setup for staff

Students never run anything in this folder. It exists so that the cohort's
use of Azure is confined to one resource group that can be deleted at the end.

## Access model

| Who | What they can do | How |
|---|---|---|
| Student's GitHub repository, `main` branch only | Update and read **their own** Container App | Managed identity with a federated credential, Contributor scoped to that single app |
| Student's own account (optional) | Look at the resource group in the portal | Reader on the resource group |
| Staff | Everything in the resource group | Owner on the resource group |

Consequences:

- No student holds a password, key or client secret for Azure. The values they
  are given (client ID, tenant ID, subscription ID) are identifiers, not secrets.
- A student cannot create resources, so cost is bounded by what `provision.sh`
  creates: one app per student, 0.25 vCPU and 0.5 GiB, at most one replica,
  scaling to zero when idle.
- A student cannot touch another student's app. Their identity has no rights on it.
- Workflows on pull request branches cannot deploy, because the federated
  credential only matches `refs/heads/main`.
- The identities are user-assigned managed identities inside the resource
  group, not app registrations, so `teardown.sh` leaves nothing behind in Entra ID.

## Before the first session

1. Publish the reference image once (push this repository to GitHub, let the
   Deploy workflow's publish job run, and make the package public).
2. Collect each student's ID and `owner/repo` into `students.csv`
   (see `students.example.csv`). The repository name is case sensitive.
3. Run `INITIAL_IMAGE=ghcr.io/<you>/notes-devops:<tag> ./provision.sh students.csv`.
4. Give each student their row of `student-settings.csv`.

## After the last session

Run `./teardown.sh`. It lists what will go, asks for the resource group name,
and deletes the group.

## Not yet verified

These scripts were written against the Azure CLI documentation and have not
been run against a subscription. Before relying on them, provision one test
student and run the Deploy and Rollback workflows from a test repository. The
points most likely to need adjusting are:

- whether Contributor on the single Container App is sufficient for
  `az containerapp update`, or whether the identity also needs Reader on the
  Container Apps environment
- whether your tenant allows you to create role assignments and federated
  credentials in this subscription
- regional availability and quota for Container Apps environments
