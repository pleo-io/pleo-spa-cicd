import {restoreS3Cache} from './restore'
import * as utils from '../utils'

const mockedUtils = utils as jest.Mocked<typeof utils>

jest.mock('../utils')

afterEach(() => jest.clearAllMocks())

describe(`S3 Cache Action - Restore cache`, () => {
    test(`
        When a cache file in S3 doesn't exists
        Then it should return a "false" processed flag
        And it should return the S3 key and tree hash used 
    `, async () => {
        mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
            'b017ebdf289ba78787da4e9c3291f0b7959e7059'
        )
        mockedUtils.fileExistsInS3.mockResolvedValue(false)

        const output = await restoreS3Cache({
            bucket: 'my-bucket',
            keyPrefix: 'horse',
            repo: {owner: 'my-org', repo: 'my-repo'}
        })

        expect(output.key).toBe(
            'my-org/my-repo/cache/horse/b017ebdf289ba78787da4e9c3291f0b7959e7059'
        )
        expect(output.processed).toBe(false)
        expect(output.treeHash).toBe('b017ebdf289ba78787da4e9c3291f0b7959e7059')

        expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
        expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({
            bucket: 'my-bucket',
            key: 'my-org/my-repo/cache/horse/b017ebdf289ba78787da4e9c3291f0b7959e7059'
        })
    })

    test(`
        When a cache file in S3 already exists
        Then it should return a "true" processed flag
        And it should return the S3 key and tree hash used
    `, async () => {
        mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
            'cba2d570993b9c21e3de282e5ba56d1638fb32de'
        )
        mockedUtils.fileExistsInS3.mockResolvedValue(true)

        const output = await restoreS3Cache({
            bucket: 'my-other-bucket',
            keyPrefix: 'horse',
            repo: {owner: 'my-org', repo: 'my-repo'}
        })

        expect(output.key).toBe(
            'my-org/my-repo/cache/horse/cba2d570993b9c21e3de282e5ba56d1638fb32de'
        )
        expect(output.processed).toBe(true)
        expect(output.treeHash).toBe('cba2d570993b9c21e3de282e5ba56d1638fb32de')

        expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
        expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({
            bucket: 'my-other-bucket',
            key: 'my-org/my-repo/cache/horse/cba2d570993b9c21e3de282e5ba56d1638fb32de'
        })
    })
})
