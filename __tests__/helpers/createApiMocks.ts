import { createMocks, RequestMethod } from "node-mocks-http";
import type { NextApiRequest, NextApiResponse } from "next";

export function createApiMocks(
  options: {
    method?: RequestMethod;
    body?: Record<string, unknown>;
    cookies?: Record<string, string>;
  } = {}
) {
  const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
    method: options.method ?? "POST",
    body: options.body,
    cookies: options.cookies,
  });
  return { req, res };
}
