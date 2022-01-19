import {saveS3Cache} from './save'
import * as utils from '../utils'

const mockedUtils = utils as jest.Mocked<typeof utils>

jest.mock('../utils')

afterEach(() => jest.clearAllMocks())

describe(`S3 Cache Action - Save cache`, () => {
    test(`Not processed yet`, async () => {
        await saveS3Cache({
            bucket: 'my-bucket',
            hash: '5948809b966891c558d7c79c0c5c401502f1a466',
            key: 'cache/horse'
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
            key: 'cache/horse'
        })
    })

    test(`Already processed`, async () => {
        await saveS3Cache({
            bucket: 'my-bucket',
            hash: '',
            key: ''
        })

        expect(mockedUtils.writeLineToFile).not.toHaveBeenCalled()
        expect(mockedUtils.copyFileToS3).not.toHaveBeenCalled()
    })
})
