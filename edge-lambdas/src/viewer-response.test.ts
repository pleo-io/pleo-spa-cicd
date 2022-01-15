import { CloudFrontResponseEvent } from "aws-lambda";
import { getHandler } from "./viewer-response";

jest.mock("./config");

describe(`Viewer response Lambda@Edge`, () => {
  test(`Adds security and cache control custom headers to a response object for prod`, async () => {
    const handler = getHandler({
      environment: "production",
      originBucketName: "test-cursor-bucket-prod",
      originBucketRegion: "eu-west-1",
    });

    const event = mockResponseEvent({ host: "app.pleo.io" });
    expect(await handler(event, {} as any, () => {})).toEqual({
      headers: {
        ...securityHeaders,
        ...cacheControlHeaders,
        ...defaultHeaders,
      },
      status: "200",
      statusDescription: "OK",
    });
  });

  test(`Adds robots custom headers to a response object in staging`, async () => {
    const handler = getHandler({
      environment: "staging",
      originBucketName: "test-origin-bucket-staging",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.staging.pleo.io",
    });

    const event = mockResponseEvent({ host: "app.staging.pleo.io" });

    expect(await handler(event, {} as any, () => {})).toEqual({
      headers: {
        ...securityHeaders,
        ...defaultHeaders,
        ...cacheControlHeaders,
        "x-robots-tag": [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      status: "200",
      statusDescription: "OK",
    });
  });

  test(`Adds security with frame blocking custom header to a response if configured`, async () => {
    const handler = getHandler({
      environment: "production",
      originBucketName: "test-origin-bucket",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.pleo.io",
      blockIframes: "true",
    });

    const event = mockResponseEvent({ host: "app.staging.pleo.io" });

    expect(await handler(event, {} as any, () => {})).toEqual({
      headers: {
        ...securityHeaders,
        "x-frame-options": [{ key: "X-Frame-Options", value: "DENY" }],
        ...defaultHeaders,
        ...cacheControlHeaders,
      },
      status: "200",
      statusDescription: "OK",
    });
  });
});

const defaultHeaders = {
  "last-modified": [{ key: "Last-Modified", value: "2016-11-25" }],
  "x-amz-meta-last-modified": [
    { key: "X-Amz-Meta-Last-Modified", value: "2016-01-01" },
  ],
};

const securityHeaders = {
  "x-content-type-options": [
    { key: "X-Content-Type-Options", value: "nosniff" },
  ],
  "referrer-policy": [{ key: "Referrer-Policy", value: "same-origin" }],
  "x-xss-protection": [{ key: "X-XSS-Protection", value: "1; mode=block" }],
};

const cacheControlHeaders = {
  "cache-control": [
    {
      key: "Cache-Control",
      value: "max-age=0,no-cache,no-store,must-revalidate",
    },
  ],
};

// Returns a mock Cloudfront viewer response event with the specified host and URI. See
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#lambda-event-structure-response-viewer for
// more info on the shape of the response events for Edge Lambdas
export const mockResponseEvent = ({
  host,
  uri = "/",
}: {
  host: string;
  uri?: string;
}): CloudFrontResponseEvent => ({
  Records: [
    {
      cf: {
        config: {
          distributionDomainName: "d111111abcdef8.cloudfront.net",
          distributionId: "EDFDVBD6EXAMPLE",
          eventType: "viewer-response" as const,
          requestId:
            "4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ==",
        },
        request: {
          uri,
          headers: {
            host: [
              {
                key: "Host",
                value: host,
              },
            ],
          },
          querystring: "",
          clientIp: "203.0.113.178",
          method: "GET",
        },
        response: {
          status: "200",
          statusDescription: "OK",
          headers: defaultHeaders,
        },
      },
    },
  ],
});
