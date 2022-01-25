import {CloudFrontHeaders, CloudFrontRequest} from 'aws-lambda'

/**
 * Appends a custom header to a passed CloudFront header map
 * @param headers - CloudFront headers map
 * @param headerName - Custom header name
 * @param headerValue - Custom header value
 * @param options.merge - Should the current header value be merged with the new one (e.g. for cookies)
 * @returns A new, modified CloudFront header maps
 */
export function setHeader(
    headers: CloudFrontHeaders,
    headerName: string,
    headerValue: string,
    options: {merge?: boolean} = {}
): CloudFrontHeaders {
    const headerKey = headerName.toLowerCase()
    const previousHeader = options.merge ? headers[headerKey] ?? [] : []
    return {
        ...headers,
        [headerKey]: [...previousHeader, {key: headerName, value: headerValue}]
    }
}

/**
 * Retrieve a header value (first if multiple values set) for a passed CloudFront request
 * @param request - CloudFront request
 * @param headerName - Header name to retrieve
 * @returns The first found value of the specified header, if available
 */
export function getHeader(request: CloudFrontRequest, headerName: string): string | undefined {
    return request.headers?.[headerName.toLowerCase()]?.[0]?.value
}
