<h1 align="center">
  🔋 Pleo SPA CI/CD - Post Preview URLs Action
</h1>

![](./screenshot.png)

<!-- action-docs-description -->

## Description

Append the URLs for branch app and storybook preview deployments to the PR description.

<!-- action-docs-description -->

Optionally, also includes a link to storybook deployment. You only need to run this action once,
when the PR is opened (see [Example Use](#example-use)).

<!-- action-docs-inputs -->

## Inputs

| parameter                | description                                    | required | default                                 |
| ------------------------ | ---------------------------------------------- | -------- | --------------------------------------- |
| token                    | GitHub token used to update the PR description | `false`  | ${{ github.token }}                     |
| marker                   | HTML comment marker for the appended content   | `false`  | <!--preview-urls-do-not-change-below--> |
| app_domain               | The domain for the app deployments             | `true`   |                                         |
| storybook_stories_domain | The domain for the storybook deployments       | `false`  |                                         |

<!-- action-docs-inputs -->

<!-- action-docs-outputs -->

<!-- action-docs-outputs -->

<!-- action-docs-runs -->

## Runs

This action is an `node12` action.

<!-- action-docs-runs -->
