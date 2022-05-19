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
const restore_1 = require('./restore')
const utils = __importStar(require('../utils'))
const mockedUtils = utils
jest.mock('../utils')
beforeEach(() => jest.clearAllMocks())
describe(`S3 Cache Action - Restore cache`, () => {
    test(
        (0, common_tags_1.stripIndents)`
        When a cache file in S3 doesn't exists
        Then it should return a "false" processed flag
        And it should return the S3 key and tree hash used 
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const treeHash = 'b017ebdf289ba78787da4e9c3291f0b7959e7059'
                mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(treeHash)
                mockedUtils.fileExistsInS3.mockResolvedValue(false)
                const output = yield (0, restore_1.restoreS3Cache)({
                    bucket: 'my-bucket',
                    keyPrefix: 'horse',
                    repo: {owner: 'my-org', repo: 'my-repo'}
                })
                expect(output.key).toBe(`cache/my-org/my-repo/horse/${treeHash}`)
                expect(output.processed).toBe(false)
                expect(output.treeHash).toBe(treeHash)
                expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
                expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({
                    bucket: 'my-bucket',
                    key: `cache/my-org/my-repo/horse/${treeHash}`
                })
            })
    )
    test(
        (0, common_tags_1.stripIndents)`
        When a cache file in S3 already exists
        Then it should return a "true" processed flag
        And it should return the S3 key and tree hash used
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const treeHash = 'cba2d570993b9c21e3de282e5ba56d1638fb32de'
                mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(treeHash)
                mockedUtils.fileExistsInS3.mockResolvedValue(true)
                const output = yield (0, restore_1.restoreS3Cache)({
                    bucket: 'my-other-bucket',
                    keyPrefix: 'horse',
                    repo: {owner: 'my-org', repo: 'my-repo'}
                })
                expect(output.key).toBe(`cache/my-org/my-repo/horse/${treeHash}`)
                expect(output.processed).toBe(true)
                expect(output.treeHash).toBe(treeHash)
                expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
                expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({
                    bucket: 'my-other-bucket',
                    key: `cache/my-org/my-repo/horse/${treeHash}`
                })
            })
    )
})
