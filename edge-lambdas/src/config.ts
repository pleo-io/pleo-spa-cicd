import {readFileSync} from 'fs'

/**
 * Retrieve config from a JSON config file. Since we can't use Lambda environment variables
 * we upload a JSON file containing env-specific configuration together with the lambda source file
 *
 * @returns The configuration object loaded from the file
 */
export function getConfig(): Config {
    return JSON.parse(readFileSync('./config.json', {encoding: 'utf8'}))
}

export type Config = {
    environment: 'staging' | 'production'
    originBucketName: string
    originBucketRegion: string
    previewDeploymentPostfix?: string
    defaultBranchName?: string
    blockIframes?: string
}
