// createSignedHttpRequest.ts
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

interface CreateSignHttpRequestParams {
  body?: string;
  headers?: Record<string, string>;
  hostname: string;
  method?: string;
  path?: string;
  port?: number;
  protocol?: string;
  query?: Record<string, string>;
  service: string;
}

export async function createSignedHttpRequest({
  body,
  headers,
  hostname,
  method = "GET",
  path = "/",
  port = 443,
  protocol = "https:",
  query,
  service,
}: CreateSignHttpRequestParams): Promise<HttpRequest> {
  const httpRequest = new HttpRequest({
    body,
    headers,
    hostname,
    method,
    path,
    port,
    protocol,
    query,
  });
  const sigV4Init = {
    credentials: defaultProvider(),
    region: process.env.AWS_DEFAULT_REGION as string,
    service,
    sha256: Sha256,
  };
  const signer = new SignatureV4(sigV4Init);
  return signer.sign(httpRequest) as Promise<HttpRequest>;
}
