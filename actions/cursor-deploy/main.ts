/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the deployment cursor file in the S3 bucket and optionally updates
 * the rollback file (in the rollback and unblock deployment modes).
 */

import * as core from '@actions/core'
import * as github from '@actions/github'

import {
    writeLineToFile,
    copyFileToS3,
    fileExistsInS3,
    removeFileFromS3,
    runAction,
    execIsSuccessful,
    execReadOutput,
    getCurrentRepoTreeHash,
    getSanitizedBranchName
} from '../utils'

const deployModes = ['default', 'rollback', 'unblock'] as const
type DeployMode = typeof deployModes[number]

runAction(async () => {
    const bucket = core.getInput('bucket_name', {required: true})
    const deployModeInput = core.getInput('deploy_mode', {required: true})
    const rollbackCommitHash = core.getInput('rollback_commit_hash')

    const output = await cursorDeploy({
        bucket,
        deployModeInput,
        rollbackCommitHash,
        ref: github.context.ref,
        repo: github.context.repo
    })

    core.setOutput('tree_hash', output.treeHash)
})

interface CursorDeployActionArgs {
    bucket: string
    deployModeInput: string
    rollbackCommitHash: string
    ref: string
    repo: {owner: string; repo: string}
}

export async function cursorDeploy({
    ref,
    bucket,
    deployModeInput,
    rollbackCommitHash,
    repo
}: CursorDeployActionArgs) {
    const deployMode = getDeployMode(deployModeInput)
    const branchName = getSanitizedBranchName(ref)
    const treeHash = await getDeploymentHash(deployMode, rollbackCommitHash)

    const rollbackKey = `${repo.owner}/${repo.repo}/rollbacks/${branchName}`
    const deployKey = `${repo.owner}/${repo.repo}/deploys/${branchName}`

    // If we're doing a regular deployment, we need to make sure there isn't an active
    // rollback for the branch we're deploying. Active rollback prevents automatic
    // deployments and requires an explicit unblocking deployment to resume them.
    if (deployMode === 'default') {
        const rollbackFileExists = await fileExistsInS3({
            bucket,
            key: rollbackKey
        })
        if (rollbackFileExists) {
            throw new Error(`${branchName} is currently blocked due to an active rollback.`)
        }
    }

    // Perform the deployment by updating the cursor file for the current branch to point
    // to the desired tree hash
    await writeLineToFile({text: treeHash, path: branchName})
    await copyFileToS3({path: branchName, bucket, key: deployKey})
    core.info(`Tree hash ${treeHash} is now the active deployment for ${branchName}.`)

    // If we're doing a rollback deployment we create a rollback file that blocks any following
    // deployments from going through.
    if (deployMode === 'rollback') {
        await copyFileToS3({path: branchName, bucket, key: rollbackKey})
        core.info(`${branchName} marked as rolled back, automatic deploys paused.`)
    }

    // If we're doing an unblock deployment, we delete the rollback file to allow the following
    // deployments to go through
    if (deployMode === 'unblock') {
        await removeFileFromS3({bucket, key: rollbackKey})
        core.info(`${branchName} has automatic deploys resumed.`)
    }

    return {treeHash}
}

/**
 * Retrieve the deploy mode from action input, and set a correct enum type
 * Deploy mode can one of the following:
 * - default - a regular deployment, releasing the latest code on the branch
 * - rollback - an emergency deployment, releasing an older version of the code and preventing following default deployments
 * - unblock - releasing the latest code on the branch and removing the default deployment block
 * @param deployMode - Deployment mode
 * @returns deployMode
 */
function getDeployMode(deployMode: string) {
    function assertDeployMode(value: any): asserts value is DeployMode {
        if (!deployModes.includes(value)) {
            throw new Error(`Incorrect deploy mode (${value})`)
        }
    }
    assertDeployMode(deployMode)
    return deployMode
}

/**
 * Establish the tree hash of the code to be deployed. If we're doing a rollback,
 * we figure out the tree hash from the explicitly passed commit hash or the previous
 * commit on the branch. We additionally validate if the input commit hash is a commit from
 * the current branch, to make sure we can only rollback within the branch.
 * Otherwise we use the head root tree hash on the current branch.
 * @param deployMode - Deployment mode
 * @param rollbackCommitHash - In rollback deploy mode, optional explicit commit hash to roll back to
 * @returns treeHash
 */
async function getDeploymentHash(deployMode: DeployMode, rollbackCommitHash?: string) {
    if (deployMode === 'rollback') {
        if (!!rollbackCommitHash && !isHeadAncestor(rollbackCommitHash)) {
            throw new Error('The selected rollback commit is not present on the branch')
        }
        // If no rollback commit is provided, we default to the previous commit on the branch
        const commit = rollbackCommitHash || 'HEAD^'
        const treeHash = await getTreeHashForCommitHash(commit)
        core.info(`Rolling back to tree hash ${treeHash} (commit ${commit})`)
        return treeHash
    }

    const treeHash = await getCurrentRepoTreeHash()
    core.info(`Using current root tree hash ${treeHash}`)
    return treeHash
}

/**
 * Validate if the passed git commit hash is present on the current branch
 * @param commitHash - commit hash to validate
 * @returns isHeadAncestor
 */
async function isHeadAncestor(commitHash: string) {
    return execIsSuccessful('git merge-base', [`--is-ancestor`, commitHash, `HEAD`])
}

/**
 * Retrieve the root tree hash for the provided commit identifier
 * @param commit - commit identifier to lookup
 * @returns treeHash
 */
async function getTreeHashForCommitHash(commit: string) {
    return execReadOutput('git rev-parse', [`${commit}:`])
}
