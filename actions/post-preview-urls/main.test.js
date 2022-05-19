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
const main_1 = require('./main')
const utils = __importStar(require('../utils'))
const github = __importStar(require('@actions/github'))
jest.mock('../utils')
jest.mock('@actions/core')
jest.mock('@actions/github')
// just making sure the mock methods are correctly typed
const mockedUtils = utils
const mockedGithub = github
// reset the counter on mock fn calls after every test
beforeEach(() => jest.clearAllMocks())
// use the actual method for sanitizing branch names
const originalUtils = jest.requireActual('../utils')
mockedUtils.getSanitizedBranchName.mockImplementation(originalUtils.getSanitizedBranchName)
describe(`Post Preview URLs action`, () => {
    test(
        (0, common_tags_1.stripIndent)`
        When the PR does not yet have the preview links for the app
        And there is no tree hash provided
        It updates the PR description
        And latest link is posted, marked as deploying
        And the permalink is not posted and it's marked as deploying
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const token = '1234'
                const mockRequest = jest.fn().mockResolvedValueOnce({
                    data: {
                        body: 'Hello World!\n Some indent',
                        head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
                    }
                })
                mockedGithub.getOctokit.mockReturnValue({request: mockRequest})
                yield (0, main_1.postPreviewUrls)({
                    domain: 'app.example.com',
                    token,
                    repo: {owner: 'my-org', repo: 'my-repo'},
                    prNumber: 1,
                    appName: '🤖 App'
                })
                expect(mockedGithub.getOctokit).toBeCalledWith(token)
                expect(mockRequest).toBeCalledWith(
                    'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                    {
                        body: (0, common_tags_1.stripIndent)`
                    Hello World!
                     Some indent
                    <!--app.example.com-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://lol-my-feature-branch-30-better.app.example.com (Deploying... 🚧)
                    _Current permalink_: (Deploying... 🚧)
                    <!--app.example.com-preview-urls-do-not-change-above-->
                `,
                        owner: 'my-org',
                        pull_number: 1,
                        repo: 'my-repo'
                    }
                )
            })
    )
    test(
        (0, common_tags_1.stripIndent)`
        When the PR already has the preview links for the app
        And there is no tree hash provided
        It updates the PR description
        And latest link is posted
        And the permalink is not posted and it's marked as deploying
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const token = '1234'
                const mockRequest = jest.fn().mockResolvedValueOnce({
                    data: {
                        body: (0, common_tags_1.stripIndent)`
                        Hello World!
                        <!--app.example.com-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://lol-my-feature-branch-30-better.app.example.com (Deploying... 🚧)
                        _Current permalink_: (Deploying... 🚧)
                        <!--app.example.com-preview-urls-do-not-change-above-->
                    `,
                        head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
                    }
                })
                mockedGithub.getOctokit.mockReturnValue({request: mockRequest})
                yield (0, main_1.postPreviewUrls)({
                    domain: 'app.example.com',
                    token,
                    repo: {owner: 'my-org', repo: 'my-repo'},
                    prNumber: 1,
                    appName: '🤖 App'
                })
                expect(mockedGithub.getOctokit).toBeCalledWith(token)
                expect(mockRequest).toBeCalledWith(
                    'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                    {
                        body: (0, common_tags_1.stripIndent)`
                    Hello World!
                    <!--app.example.com-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://lol-my-feature-branch-30-better.app.example.com
                    _Current permalink_: (Deploying... 🚧)
                    <!--app.example.com-preview-urls-do-not-change-above-->
                `,
                        owner: 'my-org',
                        pull_number: 1,
                        repo: 'my-repo'
                    }
                )
            })
    )
    test(
        (0, common_tags_1.stripIndent)`
        When the PR already has the preview links for the app
        And there is a tree hash provided
        It updates the PR description
        And latest link is posted
        And the permalink is posted
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const token = '1234'
                const permalink =
                    'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com'
                const mockRequest = jest.fn().mockResolvedValueOnce({
                    data: {
                        body: (0, common_tags_1.stripIndent)`
                        Hello World!
                        <!--app.example.com-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://lol-my-feature-branch-30-better.app.example.com
                        _Current permalink_: (Deploying... 🚧)
                        <!--app.example.com-preview-urls-do-not-change-above-->
                    `,
                        head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
                    }
                })
                mockedGithub.getOctokit.mockReturnValue({request: mockRequest})
                yield (0, main_1.postPreviewUrls)({
                    domain: 'app.example.com',
                    token,
                    permalink,
                    repo: {owner: 'my-org', repo: 'my-repo'},
                    prNumber: 1,
                    appName: '🤖 App'
                })
                expect(mockedGithub.getOctokit).toBeCalledWith(token)
                expect(mockRequest).toBeCalledWith(
                    'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                    {
                        body: (0, common_tags_1.stripIndent)`
                    Hello World!
                    <!--app.example.com-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://lol-my-feature-branch-30-better.app.example.com
                    _Current permalink_: ${permalink}
                    <!--app.example.com-preview-urls-do-not-change-above-->
                `,
                        owner: 'my-org',
                        pull_number: 1,
                        repo: 'my-repo'
                    }
                )
            })
    )
    test(
        (0, common_tags_1.stripIndent)`
        When the PR already has the preview links for another app
        And there is no preview links for the current app
        It appends the links and keeps the links for the other app
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const token = '1234'
                const permalink =
                    'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.storybook.example.com'
                const mockRequest = jest.fn().mockResolvedValueOnce({
                    data: {
                        body: (0, common_tags_1.stripIndent)`
                        Hello World!
                        <!--app.example.com-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://lol-my-feature-branch-30-better.app.example.com
                        _Current permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                        <!--app.example.com-preview-urls-do-not-change-above-->
                    `,
                        head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
                    }
                })
                mockedGithub.getOctokit.mockReturnValue({request: mockRequest})
                yield (0, main_1.postPreviewUrls)({
                    domain: 'storybook.example.com',
                    token,
                    permalink,
                    repo: {owner: 'my-org', repo: 'my-repo'},
                    prNumber: 1,
                    appName: '🤖 Storybook'
                })
                expect(mockedGithub.getOctokit).toBeCalledWith(token)
                expect(mockRequest).toBeCalledWith(
                    'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                    {
                        body: (0, common_tags_1.stripIndent)`
                        Hello World!
                        <!--app.example.com-preview-urls-do-not-change-below-->
                        ---
                        **🤖 App preview links**
                        _Latest_: https://lol-my-feature-branch-30-better.app.example.com
                        _Current permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                        <!--app.example.com-preview-urls-do-not-change-above-->
                        <!--storybook.example.com-preview-urls-do-not-change-below-->
                        ---
                        **🤖 Storybook preview links**
                        _Latest_: https://lol-my-feature-branch-30-better.storybook.example.com
                        _Current permalink_: ${permalink}
                        <!--storybook.example.com-preview-urls-do-not-change-above-->
                    `,
                        owner: 'my-org',
                        pull_number: 1,
                        repo: 'my-repo'
                    }
                )
            })
    )
    test(
        (0, common_tags_1.stripIndent)`
        When the PR already has the preview links for another app
        And there is are preview links for the current app
        It updates the links for the current app
        And keeps the links for the other app intact
        `,
        () =>
            __awaiter(void 0, void 0, void 0, function* () {
                const token = '1234'
                const permalink =
                    'https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.storybook.example.com'
                const mockRequest = jest.fn().mockResolvedValueOnce({
                    data: {
                        body: (0, common_tags_1.stripIndent)`
                    Hello World!
                    <!--storybook.example.com-preview-urls-do-not-change-below-->
                    ---
                    **🤖 Storybook preview links**
                    _Latest_: https://lol-my-feature-branch-30-better.storybook.example.com
                    _Current permalink_:https://preview-0ce99f79fa377f39248fa0633b21bdb130728674.storybook.example.com
                    <!--storybook.example.com-preview-urls-do-not-change-above-->
                    <!--app.example.com-preview-urls-do-not-change-below-->
                    ---
                    **🤖 App preview links**
                    _Latest_: https://lol-my-feature-branch-30-better.app.example.com
                    _Current permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                    <!--app.example.com-preview-urls-do-not-change-above-->
                `,
                        head: {ref: 'refs/heads/lol/my-feature-branch-30%-better'}
                    }
                })
                mockedGithub.getOctokit.mockReturnValue({request: mockRequest})
                yield (0, main_1.postPreviewUrls)({
                    domain: 'storybook.example.com',
                    token,
                    permalink,
                    repo: {owner: 'my-org', repo: 'my-repo'},
                    prNumber: 1,
                    appName: '📚 Storybook'
                })
                expect(mockedGithub.getOctokit).toBeCalledWith(token)
                expect(mockRequest).toBeCalledWith(
                    'PATCH /repos/{owner}/{repo}/pulls/{pull_number}',
                    {
                        body: (0, common_tags_1.stripIndent)`
                Hello World!
                <!--storybook.example.com-preview-urls-do-not-change-below-->
                ---
                **📚 Storybook preview links**
                _Latest_: https://lol-my-feature-branch-30-better.storybook.example.com
                _Current permalink_: ${permalink}
                <!--storybook.example.com-preview-urls-do-not-change-above-->
                <!--app.example.com-preview-urls-do-not-change-below-->
                ---
                **🤖 App preview links**
                _Latest_: https://lol-my-feature-branch-30-better.app.example.com
                _Current permalink_: https://preview-c819fdae556e892d5d25de24db6bd6997e673ec6.app.example.com
                <!--app.example.com-preview-urls-do-not-change-above-->
            `,
                        owner: 'my-org',
                        pull_number: 1,
                        repo: 'my-repo'
                    }
                )
            })
    )
})
