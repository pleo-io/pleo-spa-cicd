import { CloudFrontRequestEvent } from "aws-lambda";
import S3 from "aws-sdk/clients/s3";

import { getHandler } from "./viewer-request";

jest.mock("./config", () => ({ getConfig: () => ({}) }));
jest.mock("aws-sdk/clients/s3", () =>
  jest.fn().mockReturnValue({
    getObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockReturnValue({
        Body: JSON.stringify({}),
      }),
    }),
  })
);

const mockGetObjectFn = (S3 as jest.MockedClass<typeof S3>).mock.results[0]
  .value.getObject;

beforeEach(() => {
  mockGetObjectFn.mockReset();
});

describe(`Viewer request Lambda@Edge`, () => {
  test(`When requesting app.pleo.io 
          it modifies the request to fetch the latest production HTML
    `, async () => {
    mockGetObjectFn.mockReturnValue({
      promise: jest.fn().mockReturnValue({ Body: "some-hash-1234" }),
    });
    const handler = getHandler({
      environment: "production",
      originBucketName: "test-origin-bucket-prod",
      originBucketRegion: "eu-west-1",
    });
    const event = mockRequestEvent({ host: "app.pleo.io" });

    const response = await handler(event, {} as any, () => {});

    expect(mockGetObjectFn).toHaveBeenCalledWith({
      Bucket: "test-origin-bucket-prod",
      Key: `deploys/master`,
    });
    expect(response).toEqual(
      requestFromEvent(
        mockRequestEvent({
          host: "app.pleo.io",
          uri: "/html/some-hash-1234/index.html",
        })
      )
    );
  });

  test(`When requesting app.staging.pleo.io 
          it modifies the request to fetch the latest staging HTML
    `, async () => {
    mockGetObjectFn.mockReturnValue({
      promise: jest.fn().mockReturnValue({ Body: "some-hash-2412" }),
    });
    const handler = getHandler({
      environment: "staging",
      originBucketName: "test-origin-bucket-staging",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.staging.pleo.io",
    });
    const event = mockRequestEvent({ host: "app.staging.pleo.io" });

    const response = await handler(event, {} as any, () => {});

    expect(mockGetObjectFn).toHaveBeenCalledWith({
      Bucket: "test-origin-bucket-staging",
      Key: `deploys/master`,
    });
    expect(response).toEqual(
      requestFromEvent(
        mockRequestEvent({
          host: "app.staging.pleo.io",
          uri: "/html/some-hash-2412/index.html",
        })
      )
    );
  });

  test(`When requesting e.g. my-feature.app.staging.pleo.io
          it modifies the request to fetch the latest HTML for that branch
    `, async () => {
    mockGetObjectFn.mockReturnValue({
      promise: jest.fn().mockReturnValue({ Body: "some-hash-23125" }),
    });
    const handler = getHandler({
      environment: "staging",
      originBucketName: "test-origin-bucket-staging",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.staging.pleo.io",
    });
    const event = mockRequestEvent({ host: "my-feature.app.staging.pleo.io" });

    const response = await handler(event, {} as any, () => {});

    expect(mockGetObjectFn).toHaveBeenCalledWith({
      Bucket: "test-origin-bucket-staging",
      Key: `deploys/my-feature`,
    });
    expect(response).toEqual(
      requestFromEvent(
        mockRequestEvent({
          host: "my-feature.app.staging.pleo.io",
          uri: "/html/some-hash-23125/index.html",
        })
      )
    );
  });

  test(`Handles requests for specific html files`, async () => {
    mockGetObjectFn.mockReturnValue({
      promise: jest.fn().mockReturnValue({ Body: "some-hash-23125" }),
    });
    const handler = getHandler({
      environment: "staging",
      originBucketName: "test-origin-bucket-staging",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.staging.pleo.io",
    });
    const event = mockRequestEvent({
      host: "my-feature.app.staging.pleo.io",
      uri: "/iframe.html",
    });

    const response = await handler(event, {} as any, () => {});

    expect(mockGetObjectFn).toHaveBeenCalledWith({
      Bucket: "test-origin-bucket-staging",
      Key: `deploys/my-feature`,
    });
    expect(response).toEqual(
      requestFromEvent(
        mockRequestEvent({
          host: "my-feature.app.staging.pleo.io",
          uri: "/html/some-hash-23125/iframe.html",
        })
      )
    );
  });

  test(`Handles requests for well known files`, async () => {
    mockGetObjectFn.mockReturnValue({
      promise: jest.fn().mockReturnValue({ Body: "some-hash-23125" }),
    });
    const handler = getHandler({
      environment: "staging",
      originBucketName: "test-origin-bucket-staging",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.staging.pleo.io",
    });
    const event = mockRequestEvent({
      host: "my-feature.app.staging.pleo.io",
      uri: "/.well-known/apple-app-site-association",
    });

    const response = await handler(event, {} as any, () => {});

    expect(mockGetObjectFn).toHaveBeenCalledWith({
      Bucket: "test-origin-bucket-staging",
      Key: `deploys/my-feature`,
    });
    expect(response).toEqual(
      requestFromEvent(
        mockRequestEvent({
          host: "my-feature.app.staging.pleo.io",
          uri: "/html/some-hash-23125/.well-known/apple-app-site-association",
        })
      )
    );
  });

  test(`When requesting e.g. preview-83436472715537da0ee129412de8df6bc1287500.app.staging.pleo.io 
          it modifies the request to fetch the HTML for that tree hash
    `, async () => {
    const handler = getHandler({
      environment: "staging",
      originBucketName: "test-origin-bucket-staging",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.staging.pleo.io",
    });

    const event = mockRequestEvent({
      host: "preview-83436472715537da0ee129412de8df6bc1287500.app.staging.pleo.io",
    });

    const response = await handler(event, {} as any, () => {});

    expect(mockGetObjectFn).not.toHaveBeenCalled();
    expect(response).toEqual(
      requestFromEvent(
        mockRequestEvent({
          host: "preview-83436472715537da0ee129412de8df6bc1287500.app.staging.pleo.io",
          uri: "/html/83436472715537da0ee129412de8df6bc1287500/index.html",
        })
      )
    );
  });

  test(`When requesting preview of an unknown branch, 
          it modifies the request too return a 404 page
    `, async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetObjectFn.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error("network error, yo")),
    });
    const handler = getHandler({
      environment: "staging",
      originBucketName: "test-origin-bucket-staging",
      originBucketRegion: "eu-west-1",
      previewDeploymentPostfix: ".app.staging.pleo.io",
    });
    const event = mockRequestEvent({
      host: "what-is-this-branch.app.staging.pleo.io",
    });

    const response = await handler(event, {} as any, () => {});

    expect(mockGetObjectFn).toHaveBeenCalledWith({
      Bucket: "test-origin-bucket-staging",
      Key: `deploys/what-is-this-branch`,
    });
    expect(response).toEqual({
      status: "404",
      statusDescription: "Not found",
      headers: {
        "cache-control": [{ key: "Cache-Control", value: "max-age=100" }],
        "content-type": [{ key: "Content-Type", value: "text/html" }],
      },
      body: '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Not found</title></head><body><p>Page not found.</p></body></html>',
    });
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

// Returns a mock Cloudfront viewer request event with the specified host and URI. See
// https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-event-structure.html#example-viewer-request for
// more info on the shape of the request events for Edge Lambdas
const mockRequestEvent = ({
  host,
  uri = "/",
}: {
  host: string;
  uri?: string;
}): CloudFrontRequestEvent => ({
  Records: [
    {
      cf: {
        config: {
          distributionDomainName: "d111111abcdef8.cloudfront.net",
          distributionId: "EDFDVBD6EXAMPLE",
          eventType: "viewer-request" as const,
          requestId:
            "4TyzHTaYWb1GX1qTfsHhEqV6HUDd_BzoBZnwfnvQc_1oF26ClkoUSEQ==",
        },
        request: {
          clientIp: "203.0.113.178",
          headers: {
            host: [
              {
                key: "Host",
                value: host,
              },
            ],
            "user-agent": [
              {
                key: "User-Agent",
                value: "curl/7.66.0",
              },
            ],
            accept: [
              {
                key: "accept",
                value: "*/*",
              },
            ],
          },
          method: "GET",
          querystring: "",
          uri,
        },
      },
    },
  ],
});
const requestFromEvent = (event: CloudFrontRequestEvent) =>
  event.Records[0].cf.request;
