import { restoreS3Cache } from "./restore"
import * as utils from "../utils"

const mockedUtils = utils as jest.Mocked<typeof utils>

jest.mock("../utils")

afterEach(() => jest.clearAllMocks())

describe(`S3 Cache Action - Restore cache`, () => {
  test(`Not processed yet`, async () => {
    mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
      "b017ebdf289ba78787da4e9c3291f0b7959e7059",
    )
    mockedUtils.fileExistsInS3.mockResolvedValue(false)

    const output = await restoreS3Cache({
      bucket: "my-bucket",
      keyPrefix: "cache/horse",
    })

    expect(output.key).toBe(
      "cache/horse/b017ebdf289ba78787da4e9c3291f0b7959e7059",
    )
    expect(output.processed).toBe(false)
    expect(output.treeHash).toBe("b017ebdf289ba78787da4e9c3291f0b7959e7059")

    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({
      bucket: "my-bucket",
      key: "cache/horse/b017ebdf289ba78787da4e9c3291f0b7959e7059",
    })
  })

  test(`Processed already`, async () => {
    mockedUtils.getCurrentRepoTreeHash.mockResolvedValue(
      "cba2d570993b9c21e3de282e5ba56d1638fb32de",
    )
    mockedUtils.fileExistsInS3.mockResolvedValue(true)

    const output = await restoreS3Cache({
      bucket: "my-other-bucket",
      keyPrefix: "cache/horse",
    })

    expect(output.key).toBe(
      "cache/horse/cba2d570993b9c21e3de282e5ba56d1638fb32de",
    )
    expect(output.processed).toBe(true)
    expect(output.treeHash).toBe("cba2d570993b9c21e3de282e5ba56d1638fb32de")

    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledTimes(1)
    expect(mockedUtils.fileExistsInS3).toHaveBeenCalledWith({
      bucket: "my-other-bucket",
      key: "cache/horse/cba2d570993b9c21e3de282e5ba56d1638fb32de",
    })
  })
})
