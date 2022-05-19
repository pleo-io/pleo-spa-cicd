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
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : {default: mod}
    }
Object.defineProperty(exports, '__esModule', {value: true})
const core = __importStar(require('@actions/core'))
const fs_1 = __importDefault(require('fs'))
const utils_1 = require('../utils')
const PLEO_CONFIG_REGEX = /<script>window\.___pleoConfig=JSON\.parse\((.*)\).*<\/script>/
const INDEX_FILE_PATH = 'build/index.html'
;(0, utils_1.runAction)(() =>
    __awaiter(void 0, void 0, void 0, function* () {
        const bucket = core.getInput('bucket_name', {required: true})
        const shaBase = core.getInput('sha-base', {required: true})
        const shaHead = core.getInput('sha-head', {required: true})
        ;(0,
        utils_1.execIsSuccessful)(`aws s3 cp s3://${bucket}/html/${(0, utils_1.getTreeHashForCommitHash)(shaBase)}/index.html ${INDEX_FILE_PATH}`)
        const indexFileContent = fs_1.default.readFileSync(INDEX_FILE_PATH, {encoding: 'utf8'})
        console.log(indexFileContent)
        const pleoConfigMatch = indexFileContent.match(PLEO_CONFIG_REGEX)
        const pleoConfig = pleoConfigMatch ? JSON.parse(pleoConfigMatch[1]) : null
        if (!pleoConfig) {
            throw new Error('Pleo config is empty')
        }
        const newPleoConfig = JSON.stringify(
            Object.assign(Object.assign({}, pleoConfig), {
                currentHash: shaHead,
                hashHistory: [...(pleoConfig.hashHistory || []), shaHead].slice(-5)
            })
        )
        const newIndexFileContent = indexFileContent.replace(
            PLEO_CONFIG_REGEX,
            `<script>window.___pleoConfig=JSON.parse(${newPleoConfig});</script>`
        )
        fs_1.default.writeFileSync(INDEX_FILE_PATH, newIndexFileContent)
    })
)
