# Frontend Infrastructure GitHub Actions

This directory contains
[custom JS GitHub actions](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)
which help implementing a CI/CD pipeline described in this repository.

## Actions

| Name                                               | Description                                                               |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| [cursor-deploy](./cursor-deploy/README.md)         | Performs a deployment by updating a cursor file in an S3 bucket.          |
| [post-preview-urls](./post-preview-urls/README.md) | Update PR description with the links to the latest preview deployment.    |
| [s3-cache](./s3-cache/README.md)                   | Allows to skip a job if it was already performed for the same repo state. |

## Contributing

Each action is written in TypeScript and bundled into a single JS file using
[`@vercel/ncc`](https://github.com/vercel/ncc). Note that we version the generated JS files in the
repo, so you need to run the build locally and include the changes to the built actions in your PR.

To build the actions, run `make build`. Tests, written in Jest, you can run them with `make test`.