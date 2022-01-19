/**
 * The main action script for the S3 Cache action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Checks the existence of the cache file in the S3 bucket and returns
 * the result as the `process` output variable, which can be used by the following steps of the job.
 */

import * as core from '@actions/core'
import {getCurrentRepoTreeHash, fileExistsInS3, runAction} from '../utils'

runAction(async () => {
    const bucket = core.getInput('bucket_name', {required: true})
    const keyPrefix = core.getInput('key_prefix', {required: true})

    const output = await restoreS3Cache({bucket, keyPrefix})

    // Saving key and hash in "state" which can be retrieved by the
    // "post" run of the action (save.ts)
    // https://github.com/actions/toolkit/tree/daf8bb00606d37ee2431d9b1596b88513dcf9c59/packages/core#action-state
    core.saveState('key', output.key)
    core.saveState('hash', output.treeHash)

    core.setOutput('processed', output.processed)
    core.setOutput('hash', output.treeHash)
})

export async function restoreS3Cache({bucket, keyPrefix}: {bucket: string; keyPrefix: string}) {
    const treeHash = await getCurrentRepoTreeHash()

    const key = `${keyPrefix}/${treeHash}`
    const fileExists = await fileExistsInS3({key, bucket})

    if (fileExists) {
        core.info(`Tree hash ${treeHash} already processed.`)
        return {processed: true, treeHash, key}
    }

    core.info(`Tree hash ${treeHash} has not been processed yet.`)
    return {processed: false, treeHash, key}
}
