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
const common_tags_1 = require('common-tags')
const save_1 = require('./save')
const utils = __importStar(require('../utils'))
const mockedUtils = utils
jest.mock('../utils')
beforeEach(() => jest.clearAllMocks())
describe(`S3 Cache Action - Save cache`, () => {
    test(
        (0, common_tags_1.stripIndents)`
        When no cache file in S3 exists
        Then it should write the cache file to S3
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const treeHash = '5948809b966891c558d7c79c0c5c401502f1a466'
                yield (0, save_1.saveS3Cache)({
                    bucket: 'my-bucket',
                    hash: treeHash,
                    key: 'my-org/my-repo/cache/horse'
                })
                expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
                expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
                    text: treeHash,
                    path: treeHash
                })
                expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(1)
                expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
                    path: treeHash,
                    bucket: 'my-bucket',
                    key: 'my-org/my-repo/cache/horse'
                })
            })
    )
    test(
        (0, common_tags_1.stripIndents)`
        When a cache file in S3 already exists
        Then it should no create any new files
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                yield (0, save_1.saveS3Cache)({
                    bucket: 'my-bucket',
                    hash: '',
                    key: ''
                })
                expect(mockedUtils.writeLineToFile).not.toHaveBeenCalled()
                expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
            })
    )
})
