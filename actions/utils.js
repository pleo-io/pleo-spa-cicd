'use strict'
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
exports.getCurrentRepoTreeHash =
    exports.getTreeHashForCommitHash =
    exports.isHeadAncestor =
    exports.getSanitizedBranchName =
    exports.runAction =
    exports.removeFileFromS3 =
    exports.copyFileToS3 =
    exports.writeLineToFile =
    exports.fileExistsInS3 =
    exports.execIsSuccessful =
    exports.execReadOutput =
        void 0
const exec_1 = require('@actions/exec')
const core = __importStar(require('@actions/core'))
/**
 * Wraps "@actions/exec" exec method to return the stdout output as a string string
 * @param commandLine - command to execute
 * @param command -  optional arguments for tool
 * @returns stdout
 */
function execReadOutput(commandLine, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = ''
        yield (0, exec_1.exec)(commandLine, args, {
            listeners: {stdout: (data) => (output += data.toString())}
        })
        return output.trim()
    })
}
exports.execReadOutput = execReadOutput
/**
 * Wraps "@actions/exec" exec method to return a boolean indicating if the
 * command exited successfully
 * @param commandLine - command to execute
 * @param command -  optional arguments for tool
 * @returns isSuccessful
 */
function execIsSuccessful(commandLine, args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, exec_1.exec)(commandLine, args)
            return true
        } catch (e) {
            return false
        }
    })
}
exports.execIsSuccessful = execIsSuccessful
/**
 * Checks if a file with a given key exists in the specified S3 bucket
 * Uses "aws s3api head-object"
 * @param options.key - The key of a file in the S3 bucket
 * @param options.bucket - The name of the S3 bucket (globally unique)
 * @returns fileExists - boolean indicating if the file exists
 */
function fileExistsInS3({key, bucket}) {
    return __awaiter(this, void 0, void 0, function* () {
        return execIsSuccessful('aws s3api head-object', [`--bucket=${bucket}`, `--key=${key}`])
    })
}
exports.fileExistsInS3 = fileExistsInS3
/**
 * Writes a line of text into a file at a specified path, replacing any existing content
 * Executes "echo "my text" > ./some/file"
 * @param options.text - A string saved to the file
 * @param options.path - The local path of the file (relative to working dir)
 * @returns exitCode - shell command exit code
 */
function writeLineToFile({text, path}) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, exec_1.exec)(`/bin/bash -c "echo ${text} > ${path}"`)
    })
}
exports.writeLineToFile = writeLineToFile
/**
 * Uploads a local file at a specified path to a S3 bucket at a given given
 * Executes "aws s3 cp"
 * @param options.path - The local path of the file (relative to working dir)
 * @param options.key - The key of a file to create in the S3 bucket
 * @param options.bucket - The name of the S3 bucket (globally unique)
 * @returns exitCode - shell command exit code
 */
function copyFileToS3({path, key, bucket}) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, exec_1.exec)('aws s3 cp', [path, `s3://${bucket}/${key}`])
    })
}
exports.copyFileToS3 = copyFileToS3
/**
 * Deletes a file at a specified key from a given S3 bucket
 * Executes "aws s3 rm"
 * @param options.key - The key of a file to remove in the S3 bucket
 * @param options.bucket - The name of the S3 bucket (globally unique)
 * @returns exitCode - shell command exit code
 */
function removeFileFromS3({key, bucket}) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, exec_1.exec)('aws s3 rm', [`s3://${bucket}/${key}`])
    })
}
exports.removeFileFromS3 = removeFileFromS3
/**
 * Executes the action function and correctly handles any errors caught
 * @param action - The async function running the action script
 */
function runAction(action) {
    var _a
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return action()
        } catch (error) {
            if (error instanceof Error) {
                core.error((_a = error.stack) !== null && _a !== void 0 ? _a : error.message)
                core.setFailed(error)
            } else {
                core.setFailed(String(error))
            }
        }
    })
}
exports.runAction = runAction
/**
 * Retrieve and convert the current git branch name to a string that is safe
 * for use as a S3 file key and a URL segment
 * @returns branchName
 */
function getSanitizedBranchName(ref) {
    var _a
    const branchName =
        (_a = ref.split('refs/heads/').pop()) === null || _a === void 0
            ? void 0
            : _a.replace(/[^\w]/gi, '-').replace(/-{2,}/gi, '-').toLowerCase().slice(0, 60).trim()
    if (!branchName) {
        throw new Error('Invalid context, could not calculate sanitized branch name')
    }
    return branchName
}
exports.getSanitizedBranchName = getSanitizedBranchName
/**
 * Validate if the passed git commit hash is present on the current branch
 * @param commitHash - commit hash to validate
 * @returns isHeadAncestor
 */
function isHeadAncestor(commitHash) {
    return __awaiter(this, void 0, void 0, function* () {
        return execIsSuccessful('git merge-base', [`--is-ancestor`, commitHash, `HEAD`])
    })
}
exports.isHeadAncestor = isHeadAncestor
/**
 * Retrieve the root tree hash for the provided commit identifier
 * @param commit - commit identifier to lookup
 * @returns treeHash
 */
function getTreeHashForCommitHash(commit) {
    return __awaiter(this, void 0, void 0, function* () {
        return execReadOutput('git rev-parse', [`${commit}:`])
    })
}
exports.getTreeHashForCommitHash = getTreeHashForCommitHash
/**
 * Retrieves the current root tree hash of the git repository
 * Tree hash captures the state of the whole directory tree
 * of all the files in the repository.
 * @returns treeHash - SHA-1 root tree hash
 */
function getCurrentRepoTreeHash() {
    return __awaiter(this, void 0, void 0, function* () {
        return getTreeHashForCommitHash('HEAD')
    })
}
exports.getCurrentRepoTreeHash = getCurrentRepoTreeHash
