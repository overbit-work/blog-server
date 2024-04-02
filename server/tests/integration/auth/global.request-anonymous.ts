import type { APIRequestContext } from "playwright/test";

export async function getAnonymousRequestContext(
  playwright: typeof import('playwright-core')
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL: process.env.TEST_SERVER_BASE_URL,
  });
}
