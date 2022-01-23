import {cursorDeploy} from './main'
import * as utils from '../utils'

jest.mock('../utils')
jest.mock('@actions/core')
jest.mock('@actions/github')

// just making sure the mock methods are correctly typed
const mockedUtils = utils as jest.Mocked<typeof utils>

// reset the counter on mock fn calls after every test
afterEach(() => jest.clearAllMocks())

// use the actual method for sanitizing branch names
const originalUtils = jest.requireActual('../utils')
mockedUtils.getSanitizedBranchName.mockImplementation(originalUtils.getSanitizedBranchName)

describe(`Cursor Deploy Action`, () => {
    test(`
        When the action runs in the default deploy mode
        And the the action runs on the default branch
        And there is no active rollback on that branch/env
        Then the cursor file for the master branch is updated
        And the tree hash used is the current repo tree hash
    `, async () => {
        mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
            'b017ebdf289ba78787da4e9c3291f0b7959e7059'
        )
        mockedUtils.fileExistsInS3.mockResolvedValue(false)

        const output = await cursorDeploy({
            bucket: 'my-bucket',
            deployModeInput: 'default',
            ref: 'refs/heads/master',
            rollbackCommitHash: ''
        })

        expectRollbackFileChecked('my-bucket', 'rollbacks/master')

        expectCursorFileUpdated({
            treeHash: 'b017ebdf289ba78787da4e9c3291f0b7959e7059',
            branch: 'master',
            bucket: 'my-bucket',
            key: 'deploys/master'
        })

        expect(output.treeHash).toBe('b017ebdf289ba78787da4e9c3291f0b7959e7059')
    })

    test(`
        When the action runs in the default deploy mode
        And the the action runs on a feature branch
        And there is no active rollback on that branch/env
        Then the cursor file for the feature branch is updated
        And the tree hash used is the current repo tree hash
    `, async () => {
        mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
            '553b0cb96ac21ffc0583e5d8d72343b1faa90dfd'
        )
        mockedUtils.fileExistsInS3.mockResolvedValue(false)

        const output = await cursorDeploy({
            bucket: 'my-bucket',
            deployModeInput: 'default',
            ref: 'refs/heads/lol/my-feature-branch-30%-better',
            rollbackCommitHash: ''
        })

        expectRollbackFileChecked('my-bucket', 'rollbacks/lol-my-feature-branch-30--better')

        expectCursorFileUpdated({
            treeHash: '553b0cb96ac21ffc0583e5d8d72343b1faa90dfd',
            branch: 'lol-my-feature-branch-30--better',
            bucket: 'my-bucket',
            key: 'deploys/lol-my-feature-branch-30--better'
        })

        expect(output.treeHash).toBe('553b0cb96ac21ffc0583e5d8d72343b1faa90dfd')
    })

    test(`
        When the action runs in the default deploy mode
        And there is an active rollback on that branch/env
        Then the cursor file for the feature branch is not updated
        And the action returns a error
    `, async () => {
        mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
            'b017ebdf289ba78787da4e9c3291f0b7959e7059'
        )
        mockedUtils.fileExistsInS3.mockResolvedValue(true)

        const promise = cursorDeploy({
            bucket: 'my-bucket',
            deployModeInput: 'default',
            ref: 'refs/heads/master',
            rollbackCommitHash: ''
        })

        expect(promise).rejects.toEqual(
            new Error('master is currently blocked due to an active rollback.')
        )

        await promise.catch((error) => error)
        expectRollbackFileChecked('my-bucket', 'rollbacks/master')

        expect(mockedUtils.writeLineToFile).not.toHaveBeenCalled()
        expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
    })

    test(`
        When the action runs in the rollback deploy mode
        And no specific rollback hash is provided
        Then the cursor file is updated
        And the tree hash used is the previous commit tree hash
    `, async () => {
        mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
            'b017ebdf289ba78787da4e9c3291f0b7959e7059'
        )
        mockedUtils.fileExistsInS3.mockResolvedValue(false)
        mockedUtils.execIsSuccessful.mockResolvedValue(true)
        mockedUtils.execReadOutput.mockResolvedValue('32439d157a7e346d117a6a3c47d511526bd45012')

        const output = await cursorDeploy({
            bucket: 'my-prod-bucket',
            deployModeInput: 'rollback',
            ref: 'refs/heads/master',
            rollbackCommitHash: ''
        })

        expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()
        expect(mockedUtils.execReadOutput).toHaveBeenCalledWith('git rev-parse', ['HEAD^:'])

        expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
        expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
            text: '32439d157a7e346d117a6a3c47d511526bd45012',
            path: 'master'
        })

        expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(2)
        expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
            path: 'master',
            bucket: 'my-prod-bucket',
            key: 'deploys/master'
        })

        expect(mockedUtils.copyFileToS3).toHaveBeenLastCalledWith({
            path: 'master',
            bucket: 'my-prod-bucket',
            key: 'rollbacks/master'
        })

        expect(output.treeHash).toBe('32439d157a7e346d117a6a3c47d511526bd45012')
    })

    test(`
        When the action runs in the rollback deploy mode
        And a specific rollback hash is provided
        Then the cursor file is updated
        And the tree hash used is the tree hash of the passed commit hash
    `, async () => {
        mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
            'b017ebdf289ba78787da4e9c3291f0b7959e7059'
        )
        mockedUtils.fileExistsInS3.mockResolvedValue(false)
        mockedUtils.execIsSuccessful.mockResolvedValue(true)
        mockedUtils.execReadOutput.mockResolvedValue('b6e1c0468f4705b8cd0f18a04cd28ef7b9da7425')

        const output = await cursorDeploy({
            bucket: 'my-bucket',
            deployModeInput: 'rollback',
            rollbackCommitHash: 'fc24d309398cbf6d53237e05e4d2a8cd2de57cc7',
            ref: 'refs/heads/master'
        })

        expect(mockedUtils.fileExistsInS3).not.toHaveBeenCalled()
        expect(mockedUtils.execReadOutput).toHaveBeenCalledWith('git rev-parse', [
            'fc24d309398cbf6d53237e05e4d2a8cd2de57cc7:'
        ])

        expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
        expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
            text: 'b6e1c0468f4705b8cd0f18a04cd28ef7b9da7425',
            path: 'master'
        })

        expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(2)
        expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
            path: 'master',
            bucket: 'my-bucket',
            key: 'deploys/master'
        })

        expect(mockedUtils.copyFileToS3).toHaveBeenLastCalledWith({
            path: 'master',
            bucket: 'my-bucket',
            key: 'rollbacks/master'
        })

        expect(output.treeHash).toBe('b6e1c0468f4705b8cd0f18a04cd28ef7b9da7425')
    })
})

//#region Custom Assertions

function expectCursorFileUpdated(args: {
    treeHash: string
    branch: string
    bucket: string
    key: string
}) {
    expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
    expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
        text: args.treeHash,
        path: args.branch
    })

    expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
        path: args.branch,
        bucket: args.bucket,
        key: args.key
    })
}

function expectRollbackFileChecked(bucket: string, key: string) {
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({bucket, key})
}

//#endregion Custom Assertions
