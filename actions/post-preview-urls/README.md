# Post preview URLs Action

![](./screenshot.png)

Update PR description with the links to the latest preview deployment of that PR. Optionally, also
includes a link to storybook deployment. You only need to run this action once, when the PR is
opened (see [Example Use](#example-use)).

## Inputs

| Name                     | Description                                    | Type     | Default                                   | Required |
| ------------------------ | ---------------------------------------------- | -------- | ----------------------------------------- | :------: |
| token                    | GitHub token used to update the PR description | `string` | n/a                                       |   yes    |
| app_domain               | The base URL for the app deployments           | `string` | n/a                                       |   yes    |
| marker                   | HTML comment marker for the appended content   | `string` | `<!--preview-urls-do-not-change-below-->` |  false   |
| storybook_stories_domain | The base URL for the storybook deployments     | `string` | n/a                                       |  false   |

## Example Use

```yml
on:
    pull_request:
        types: [opened]
jobs:
    update-pr-desc:
        name: Post Preview URLs to PR Description
        runs-on: ubuntu-20.04
        steps:
            - uses: actions/checkout@v2
            - uses: 'pleo-io/frontend-infrastructure/actions/post-preview-urls@v1'
              with:
                  token: ${{ secrets.GITHUB_TOKEN }}
                  app_domain: my-app.preview.example.com
                  storybook_stories_domain: my-app-stories.preview.example.com
```
