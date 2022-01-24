import {saveS3Cache} from './save'
import * as utils from '../utils'

const mockedUtils = utils as jest.Mocked<typeof utils>

jest.mock('../utils')

afterEach(() => jest.clearAllMocks())

describe(`S3 Cache Action - Save cache`, () => {
    test(`
        When no cache file in S3 exists
        Then it should write the cache file to S3
    `, async () => {
        await saveS3Cache({
            bucket: 'my-bucket',
            hash: '5948809b966891c558d7c79c0c5c401502f1a466',
            key: 'my-org/my-repo/cache/horse'
        })

        expect(mockedUtils.writeLineToFile).toHaveBeenCalledTimes(1)
        expect(mockedUtils.writeLineToFile).toHaveBeenCalledWith({
            text: '5948809b966891c558d7c79c0c5c401502f1a466',
            path: '5948809b966891c558d7c79c0c5c401502f1a466'
        })

        expect(mockedUtils.copyFileToS3).toHaveBeenCalledTimes(1)
        expect(mockedUtils.copyFileToS3).toHaveBeenCalledWith({
            path: '5948809b966891c558d7c79c0c5c401502f1a466',
            bucket: 'my-bucket',
            key: 'my-org/my-repo/cache/horse'
        })
    })

    test(`
        When a cache file in S3 already exists
        Then it should no create any new files
    `, async () => {
        await saveS3Cache({
            bucket: 'my-bucket',
            hash: '',
            key: ''
        })

        expect(mockedUtils.writeLineToFile).not.toHaveBeenCalled()
        expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
    })
})
