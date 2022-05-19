/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the deployment cursor file in the S3 bucket and optionally updates
 * the rollback file (in the rollback and unblock deployment modes).
 */

import * as core from '@actions/core'
import fs from 'fs'

import {runAction, getTreeHashForCommitHash, execIsSuccessful} from '../utils'

const PLEO_CONFIG_REGEX = /<script>window\.___pleoConfig=JSON\.parse\((.*)\).*<\/script>/
const INDEX_FILE_PATH = 'build/index.html'

runAction(async () => {
    const bucket = core.getInput('bucket_name', {required: true})
    const shaBase = core.getInput('sha-base', {required: true})
    const shaHead = core.getInput('sha-head', {required: true})

    execIsSuccessful(
        `aws s3 cp s3://${bucket}/html/${getTreeHashForCommitHash(
            shaBase
        )}/index.html ${INDEX_FILE_PATH}`
    )

    const indexFileContent = fs.readFileSync(INDEX_FILE_PATH, {encoding: 'utf8'})
    console.log(indexFileContent)
    const pleoConfigMatch = indexFileContent.match(PLEO_CONFIG_REGEX)
    const pleoConfig = pleoConfigMatch ? JSON.parse(pleoConfigMatch[1]) : null

    if (!pleoConfig) {
        throw new Error('Pleo config is empty')
    }

    const newPleoConfig = JSON.stringify({
        ...pleoConfig,
        currentHash: shaHead,
        hashHistory: [...(pleoConfig.hashHistory || []), shaHead].slice(-5)
    })

    const newIndexFileContent = indexFileContent.replace(
        PLEO_CONFIG_REGEX,
        `<script>window.___pleoConfig=JSON.parse(${newPleoConfig});</script>`
    )

    fs.writeFileSync(INDEX_FILE_PATH, newIndexFileContent)
})
