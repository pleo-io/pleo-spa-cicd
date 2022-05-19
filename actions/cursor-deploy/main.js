'use strict'
/**
 * Custom Cursor Deploy GitHub action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Updates the deployment cursor file in the S3 bucket and optionally updates
 * the rollback file (in the rollback and unblock deployment modes).
 */
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                      return m[k]
                  }
              })
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k
              o[k2] = m[k]
          })
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', {enumerable: true, value: v})
          }
        : function (o, v) {
              o['default'] = v
          })
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod
        var result = {}
        if (mod != null)
            for (var k in mod)
                if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k)
        __setModuleDefault(result, mod)
        return result
    }
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value)
                  })
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value))
                } catch (e) {
                    reject(e)
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value))
                } catch (e) {
                    reject(e)
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next())
        })
    }
Object.defineProperty(exports, '__esModule', {value: true})
exports.cursorDeploy = void 0
const core = __importStar(require('@actions/core'))
const github = __importStar(require('@actions/github'))
const utils_1 = require('../utils')
const deployModes = ['default', 'rollback', 'unblock']
;(0, utils_1.runAction)(() =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c
        const bucket = core.getInput('bucket_name', {required: true})
        const deployModeInput = core.getInput('deploy_mode', {required: true})
        const rollbackCommitHash = core.getInput('rollback_commit_hash')
        const output = yield cursorDeploy({
            bucket,
            deployModeInput,
            rollbackCommitHash,
            ref:
                (_c =
                    (_b =
                        (_a = github.context.payload) === null || _a === void 0
                            ? void 0
                            : _a.pull_request) === null || _b === void 0
                        ? void 0
                        : _b.head.ref) !== null && _c !== void 0
                    ? _c
                    : github.context.ref
        })
        core.setOutput('tree_hash', output.treeHash)
    })
)
function cursorDeploy({ref, bucket, deployModeInput, rollbackCommitHash}) {
    return __awaiter(this, void 0, void 0, function* () {
        const deployMode = getDeployMode(deployModeInput)
        const branchName = (0, utils_1.getSanitizedBranchName)(ref)
        const treeHash = yield getDeploymentHash(deployMode, rollbackCommitHash)
        const rollbackKey = `rollbacks/${branchName}`
        const deployKey = `deploys/${branchName}`
        if (deployMode === 'default' || deployMode === 'unblock') {
            const rollbackFileExists = yield (0, utils_1.fileExistsInS3)({bucket, key: rollbackKey})
            // If we're doing a regular deployment, we need to make sure there isn't an active
            // rollback for the branch we're deploying. Active rollback prevents automatic
            // deployments and requires an explicit unblocking deployment to resume them.
            if (deployMode === 'default' && rollbackFileExists) {
                throw new Error(`${branchName} is currently blocked due to an active rollback.`)
            }
            // If we're unblocking a branch after a rollback, it only makes sense if there is an
            // active rollback
            if (deployMode === 'unblock' && !rollbackFileExists) {
                throw new Error(
                    `${branchName} does not have an active rollback, you can't unblock.`
                )
            }
        }
        // Perform the deployment by updating the cursor file for the current branch to point
        // to the desired tree hash
        yield (0, utils_1.writeLineToFile)({text: treeHash, path: branchName})
        yield (0, utils_1.copyFileToS3)({path: branchName, bucket, key: deployKey})
        core.info(`Tree hash ${treeHash} is now the active deployment for ${branchName}.`)
        // If we're doing a rollback deployment we create a rollback file that blocks any following
        // deployments from going through.
        if (deployMode === 'rollback') {
            yield (0, utils_1.copyFileToS3)({path: branchName, bucket, key: rollbackKey})
            core.info(`${branchName} marked as rolled back, automatic deploys paused.`)
        }
        // If we're doing an unblock deployment, we delete the rollback file to allow the following
        // deployments to go through
        if (deployMode === 'unblock') {
            yield (0, utils_1.removeFileFromS3)({bucket, key: rollbackKey})
            core.info(`${branchName} has automatic deploys resumed.`)
        }
        return {treeHash}
    })
}
exports.cursorDeploy = cursorDeploy
/**
 * Retrieve the deploy mode from action input, and set a correct enum type
 * Deploy mode can one of the following:
 * - default - a regular deployment, releasing the latest code on the branch
 * - rollback - an emergency deployment, releasing an older version of the code and preventing following default deployments
 * - unblock - releasing the latest code on the branch and removing the default deployment block
 * @param deployMode - Deployment mode
 * @returns deployMode
 */
function getDeployMode(deployMode) {
    function assertDeployMode(value) {
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
function getDeploymentHash(deployMode, rollbackCommitHash) {
    return __awaiter(this, void 0, void 0, function* () {
        if (deployMode === 'rollback') {
            if (!!rollbackCommitHash && !(yield (0, utils_1.isHeadAncestor)(rollbackCommitHash))) {
                throw new Error('The selected rollback commit is not present on the branch')
            }
            // If no rollback commit is provided, we default to the previous commit on the branch
            const commit = rollbackCommitHash || 'HEAD^'
            const treeHash = yield (0, utils_1.getTreeHashForCommitHash)(commit)
            core.info(`Rolling back to tree hash ${treeHash} (commit ${commit})`)
            return treeHash
        }
        const treeHash = yield (0, utils_1.getCurrentRepoTreeHash)()
        core.info(`Using current root tree hash ${treeHash}`)
        return treeHash
    })
}
