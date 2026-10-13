# ACCA7023 Notes DevOps Practical Labs

Table order below is the intended teaching sequence. Reorder this table to
resequence labs. Filenames and titles are descriptive, not numbered, so
reordering never requires a rename. Each lab does refer back to earlier labs
by title, so check those references if the order changes.

| Title | File | Needs |
|-------|------|-------|
| Agile Setup and Git Workflow | lab_agile_setup_and_git_workflow.html | GitHub account, Git |
| Notes API and the Repository Pattern | lab_notes_api_and_the_repository_pattern.html | Node.js 22, Git Bash |
| React Front End and Component Tests | lab_react_front_end_and_component_tests.html | Node.js 22 |
| Back End Tests and Coverage Gates | lab_back_end_tests_and_coverage_gates.html | Node.js 22 |
| Browser Testing with Playwright | lab_browser_testing_with_playwright.html | Node.js 22, 120 MB browser download |
| Containerising the Application | lab_containerising_the_application.html | Docker Desktop |
| Continuous Integration with GitHub Actions | lab_continuous_integration_with_github_actions.html | Public GitHub repository |
| Jenkins Pipeline Comparison | lab_jenkins_pipeline_comparison.html | Docker Desktop, about 2 GB free, port 8080 |
| Continuous Deployment to Azure Container Apps | lab_continuous_deployment_to_azure_container_apps.html | Per-student values from `infra/provision.sh` |
| Configuration Management with Ansible | lab_configuration_management_with_ansible.html | Docker Desktop, ports 8181 and 8182 |
| Delivering a Story Through the Pipeline | lab_delivering_a_story_through_the_pipeline.html | All of the above working. No solution is embedded |

The Ansible lab is independent of the pipeline and can be taught anywhere
after Containerising the Application.

## Regenerating

The sheets are generated from the tested code in this repository, so code in
a sheet cannot drift from code that has been run.

```bash
cd worksheetbuilder/skills/tools/lab-assembler && npm install && npm run build
cd ../genscripts && node gen-acca7023-all.mjs
```

The module title printed in each header is set once, as `MODULE_TITLE` in
`genscripts/acca7023-common.mjs`.

## Moodle upload instructions

1. In your Moodle course, add a File resource for each lab.
2. Upload the HTML file. Set Display to "In frame" or "Open" (not Force download).
3. Each file is self-contained. The solution is embedded and revealed on demand.
   Encourage students to attempt the lab before clicking "Show Solution".
