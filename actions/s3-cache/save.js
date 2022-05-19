'use strict'
/**
 * Runs after the end of the job (using runs.post option in action.yml).
 * Only runs on successful completion of the job which it's used for.
 * @see {@link https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#post}
 *
 * Uploads a cache file to the S3 bucket, if the file was not uploaded before.
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
exports.saveS3Cache = void 0
const core = __importStar(require('@actions/core'))
const utils_1 = require('../utils')
;(0, utils_1.runAction)(() => {
    const bucket = core.getInput('bucket_name', {required: true})
    const hash = core.getState('hash')
    const key = core.getState('key')
    return saveS3Cache({bucket, hash, key})
})
function saveS3Cache({bucket, hash, key}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!hash || !key) {
            core.info(`Tree hash already processed, skipping saving the cache file.`)
            return
        }
        // The content of the file doesn't really matter,
        // since we're only checking if the file exists
        yield (0, utils_1.writeLineToFile)({text: hash, path: hash})
        yield (0, utils_1.copyFileToS3)({path: hash, bucket, key})
        core.info(`Tree hash ${hash} was processed, saved the ${key} cache file.`)
    })
}
exports.saveS3Cache = saveS3Cache
