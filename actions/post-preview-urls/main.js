'use strict'
/**
 * Post the feature branch preview links to PR description
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
exports.postPreviewUrls = void 0
const core = __importStar(require('@actions/core'))
const github = __importStar(require('@actions/github'))
const utils_1 = require('../utils')
;(0, utils_1.runAction)(() =>
    __awaiter(void 0, void 0, void 0, function* () {
        var _a
        const token = core.getInput('token', {required: true})
        const domain = core.getInput('domain', {required: true})
        const permalink = core.getInput('permalink')
        const appName = core.getInput('app_name', {required: true})
        const repo = github.context.repo
        const prNumber =
            (_a = github.context.payload.pull_request) === null || _a === void 0
                ? void 0
                : _a.number
        yield postPreviewUrls({domain, permalink, token, prNumber, repo, appName})
    })
)
function postPreviewUrls({token, domain, repo, prNumber, permalink, appName}) {
    var _a, _b, _c, _d
    return __awaiter(this, void 0, void 0, function* () {
        if (!prNumber) {
            throw new Error('Called outside of a PR context.')
        }
        const octokit = github.getOctokit(token)
        const latestPR = yield octokit.request(
            'GET /repos/{owner}/{repo}/pulls/{pull_number}',
            Object.assign(Object.assign({}, repo), {pull_number: prNumber})
        )
        const branchName = (0, utils_1.getSanitizedBranchName)(latestPR.data.head.ref)
        const prBody = latestPR.data.body
        const markerStart = `<!--${domain}-preview-urls-do-not-change-below-->`
        const markerEnd = `<!--${domain}-preview-urls-do-not-change-above-->`
        const isFreshPR = !(prBody === null || prBody === void 0
            ? void 0
            : prBody.includes(markerStart))
        const isDeploying = !permalink && isFreshPR
        const prDescriptionAbove =
            (_b =
                (_a =
                    prBody === null || prBody === void 0
                        ? void 0
                        : prBody.split(markerStart)[0]) === null || _a === void 0
                    ? void 0
                    : _a.trim()) !== null && _b !== void 0
                ? _b
                : ''
        const prDescriptionBelow =
            (_d =
                (_c =
                    prBody === null || prBody === void 0
                        ? void 0
                        : prBody.split(markerEnd).pop()) === null || _c === void 0
                    ? void 0
                    : _c.trim()) !== null && _d !== void 0
                ? _d
                : ''
        const body = `${prDescriptionAbove}
${markerStart}
---
**${appName} preview links**
_Latest_: https://${branchName}.${domain}${isDeploying ? ' (Deploying... 🚧)' : ''}
_Current permalink_: ${permalink !== null && permalink !== void 0 ? permalink : '(Deploying... 🚧)'}
${markerEnd}
${isFreshPR ? '' : prDescriptionBelow}`.trimEnd()
        yield octokit.request(
            'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
            Object.assign(Object.assign({}, repo), {pull_number: prNumber, body})
        )
    })
}
exports.postPreviewUrls = postPreviewUrls
