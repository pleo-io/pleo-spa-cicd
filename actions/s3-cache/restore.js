'use strict'
/**
 * The main action script for the S3 Cache action
 * @see {@link https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action}
 *
 * Checks the existence of the cache file in the S3 bucket and returns
 * the result as the `process` output variable, which can be used by the following steps of the job.
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
exports.restoreS3Cache = void 0
const core = __importStar(require('@actions/core'))
const github = __importStar(require('@actions/github'))
const utils_1 = require('../utils')
;(0, utils_1.runAction)(() =>
    __awaiter(void 0, void 0, void 0, function* () {
        const bucket = core.getInput('bucket_name', {required: true})
        const keyPrefix = core.getInput('key_prefix')
        const repo = github.context.repo
        const output = yield restoreS3Cache({bucket, keyPrefix, repo})
        // Saving key and hash in "state" which can be retrieved by the
        // "post" run of the action (save.ts)
        // https://github.com/actions/toolkit/tree/daf8bb00606d37ee2431d9b1596b88513dcf9c59/packages/core#action-state
        core.saveState('key', output.key)
        core.saveState('hash', output.treeHash)
        core.setOutput('processed', output.processed)
        core.setOutput('hash', output.treeHash)
    })
)
function restoreS3Cache({bucket, keyPrefix, repo}) {
    return __awaiter(this, void 0, void 0, function* () {
        const treeHash = yield (0, utils_1.getCurrentRepoTreeHash)()
        const key = `cache/${repo.owner}/${repo.repo}/${keyPrefix}/${treeHash}`
        const fileExists = yield (0, utils_1.fileExistsInS3)({key, bucket})
        if (fileExists) {
            core.info(`Tree hash ${treeHash} already processed.`)
            return {processed: true, treeHash, key}
        }
        core.info(`Tree hash ${treeHash} has not been processed yet.`)
        return {processed: false, treeHash, key}
    })
}
exports.restoreS3Cache = restoreS3Cache
