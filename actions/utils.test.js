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
const utils = __importStar(require('./utils'))
const exec_1 = require('@actions/exec')
jest.mock('@actions/core')
jest.mock('@actions/exec')
// just making sure the mock methods are correctly typed
const mockedExec = exec_1.exec
// reset the counter on mock fn calls after every test
beforeEach(() => jest.clearAllMocks())
describe(`Actions Utils`, () => {
    test(`isHeadAncestor uses git CLI to check if the commit is part of the current branch, returns true when it is`, () =>
        __awaiter(void 0, void 0, void 0, function* () {
            mockedExec.mockResolvedValue(0)
            const hash = '5265ef99f1c8e18bcd282a11a4b752731cad5665'
            const output = yield utils.isHeadAncestor(hash)
            expect(mockedExec).toHaveBeenCalledWith('git merge-base', [
                '--is-ancestor',
                hash,
                'HEAD'
            ])
            expect(output).toBe(true)
        }))
    test(`isHeadAncestor uses git CLI to check if the commit is part of the current branch, returns false when it is not`, () =>
        __awaiter(void 0, void 0, void 0, function* () {
            mockedExec.mockRejectedValue(128)
            const hash = '5265ef99f1c8e18bcd282a11a4b752731cad5665'
            const output = yield utils.isHeadAncestor(hash)
            expect(mockedExec).toHaveBeenCalledWith('git merge-base', [
                '--is-ancestor',
                hash,
                'HEAD'
            ])
            expect(output).toBe(false)
        }))
    test(`getTreeHashForCommitHash uses git CLI to check if the commit is part of the current branch, returns false when it is not`, () =>
        __awaiter(void 0, void 0, void 0, function* () {
            mockedExec.mockResolvedValue(0)
            const hash = '5265ef99f1c8e18bcd282a11a4b752731cad5665'
            const output = yield utils.getTreeHashForCommitHash(hash)
            expect(mockedExec).toHaveBeenCalledWith(
                'git rev-parse',
                ['5265ef99f1c8e18bcd282a11a4b752731cad5665:'],
                {
                    listeners: {stdout: expect.any(Function)}
                }
            )
            expect(output).toBe('')
        }))
    test(`getCurrentRepoTreeHash uses git CLI to return the latest tree hash of the root of the repo`, () =>
        __awaiter(void 0, void 0, void 0, function* () {
            mockedExec.mockResolvedValue(0)
            const output = yield utils.getCurrentRepoTreeHash()
            expect(mockedExec).toHaveBeenCalledWith('git rev-parse', ['HEAD:'], {
                listeners: {stdout: expect.any(Function)}
            })
            expect(output).toBe('')
        }))
    test(`writeLineToFile creates a file using a shell script`, () =>
        __awaiter(void 0, void 0, void 0, function* () {
            mockedExec.mockResolvedValue(0)
            yield utils.writeLineToFile({path: '/some/file', text: 'hello world'})
            expect(mockedExec).toHaveBeenCalledWith(`/bin/bash -c "echo hello world > /some/file"`)
        }))
    describe('S3 Utils', () => {
        test(`fileExistsInS3 uses AWS CLI to check for of an object in S3 bucket, returns true if it exists`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                mockedExec.mockResolvedValue(0)
                const output = yield utils.fileExistsInS3({key: 'my/key', bucket: 'my-bucket'})
                expect(mockedExec).toHaveBeenCalledWith('aws s3api head-object', [
                    '--bucket=my-bucket',
                    '--key=my/key'
                ])
                expect(output).toBe(true)
            }))
        test(`fileExistsInS3 uses AWS CLI to check for of an object in S3 bucket, returns true if it exists`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                mockedExec.mockRejectedValue(255)
                const output = yield utils.fileExistsInS3({key: 'my/key', bucket: 'my-bucket'})
                expect(mockedExec).toHaveBeenCalledWith('aws s3api head-object', [
                    '--bucket=my-bucket',
                    '--key=my/key'
                ])
                expect(output).toBe(false)
            }))
        test(`copyFileToS3 uses AWS CLI to copy a local file to S3 bucket`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                mockedExec.mockResolvedValue(0)
                yield utils.copyFileToS3({path: '/some/file', key: 'my/key', bucket: 'my-bucket'})
                expect(mockedExec).toHaveBeenCalledWith('aws s3 cp', [
                    '/some/file',
                    's3://my-bucket/my/key'
                ])
            }))
        test(`removeFileFromS3 uses AWS CLI to delete a file from S3 bucket`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                mockedExec.mockResolvedValue(0)
                yield utils.removeFileFromS3({key: 'my/key', bucket: 'my-bucket'})
                expect(mockedExec).toHaveBeenCalledWith('aws s3 rm', ['s3://my-bucket/my/key'])
            }))
    })
    describe('Branch Sanitize - getSanitizedBranchName', () => {
        test(`sanitizes a full git ref into a DNS-ready string`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const output = utils.getSanitizedBranchName('refs/heads/hello/world')
                expect(output).toBe('hello-world')
            }))
        test(`replaces all non-word characters with a dash`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const output = utils.getSanitizedBranchName(
                    'refs/heads/hello/world-100%_ready,for.this!here:it"a)b(c{d}e'
                )
                expect(output).toBe('hello-world-100-_ready-for-this-here-it-a-b-c-d-e')
            }))
        test(`removes multiple dashes in a row`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const output = utils.getSanitizedBranchName(
                    'refs/heads/hello/my-very-weird_branch-100%%%-original'
                )
                expect(output).toBe('hello-my-very-weird_branch-100-original')
            }))
        test(`caps the length of the sanitized name to 60 characters`, () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const output = utils.getSanitizedBranchName(
                    'refs/heads/hello/my-very-weird_branch-100-original-whoooohoooooo-lets-do_it'
                )
                expect(output).toBe('hello-my-very-weird_branch-100-original-whoooohoooooo-lets-d')
            }))
    })
})
