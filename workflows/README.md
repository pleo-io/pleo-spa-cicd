# Frontend Infrastructure Reusable Workflows

This directory contains
[reusable GitHub workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
which help implementing a CI/CD pipeline described in this repository.

## Workflows

### Build

Efficiently runs the build script (defined in `package.json`), bundles and
uploads the result to an S3 registry bucket.

#### Inputs

| Name         | Description                                                                | Type     | Default | Required |
| ------------ | -------------------------------------------------------------------------- | -------- | ------- | :------: |
| bucket_name  | Name of the S3 registry bucket                                             | `string` | n/a     |   yes    |
| build_dir    | Name of the directory where the production output is built                 | `string` | n/a     |   yes    |
| build_script | Name of the script in package.json used for building the production output | `string` | n/a     |   yes    |

#### Secrets

| Name                  | Description                                                       | Required |
| --------------------- | ----------------------------------------------------------------- | :------: |
| AWS_ACCESS_KEY_ID     | ID of a AWS key that allows r/w access to the registry bucket     |   yes    |
| AWS_SECRET_ACCESS_KEY | Secret of a AWS key that allows r/w access to the registry bucket |   yes    |

#### Outputs

| Name       | Description                                 |
| ---------- | ------------------------------------------- |
| tree_hash  | Tree hash of the code built                 |
| bundle_uri | S3 URI of the bundle in the registry bucket |

#### Example Use

```yml
build:
  uses: pleo-io/frontend-infrastructure/workflows/build.yml@v1
  with:
    build_script: build:app
    build_dir: dist
    bucket_name: my-registry-bucket
  secrets:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID_REGISTRY }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY_REGISTRY }}
```

### Deploy

Copies the output files from the registry to the origin S3 bucket and updates
the cursor file for the current branch.

#### Inputs

| Name         | Description                                    | Type      | Default | Required |
| ------------ | ---------------------------------------------- | --------- | ------- | :------: |
| environment  | Name of the deployment environment             | `string`  | n/a     |   yes    |
| bundle_uri   | S3 URI of the bundle in the registry bucket    | `string`  | n/a     |   yes    |
| tree_hash    | Tree hash of the code to deploy                | `string`  | n/a     |   yes    |
| bucket_name  | Name of the S3 origin bucket                   | `string`  | n/a     |   yes    |
| domain_name  | Domain name for the app (e.g. app.example.com) | `string`  | n/a     |   yes    |
| apply_config | Should apply:config npm script be ran          | `boolean` | `false` |    no    |

#### Secrets

| Name                  | Description                                                                                            | Required |
| --------------------- | ------------------------------------------------------------------------------------------------------ | :------: |
| AWS_ACCESS_KEY_ID     | ID of a AWS key that allows r/w access to the origin bucket and read access to the registry bucket     |   yes    |
| AWS_SECRET_ACCESS_KEY | Secret of a AWS key that allows r/w access to the origin bucket and read access to the registry bucket |   yes    |

#### Outputs

| Name           | Description                              |
| -------------- | ---------------------------------------- |
| deployment_url | URL where the deployment can be accessed |

#### Example Use

```yml
deploy:
  uses: pleo-io/frontend-infrastructure/workflows/deploy.yml@v1
  needs: build
  with:
    environment: staging
    bundle_uri: ${{ needs.build.outputs.bundle_uri }}
    tree_hash: ${{ needs.build.outputs.tree_hash }}
    bucket_name: my-origin-bucket
    domain_name: app.staging.example.com
    apply_config: true
  secrets:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```
