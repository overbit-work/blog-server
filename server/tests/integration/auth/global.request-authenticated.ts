import type { APIRequestContext } from "playwright/test";
import { getAnonymousRequestContext } from "./global.request-anonymous";

export interface AuthHeaders {
  Authorization: string;
  [key: string]: string;
}

export async function getAuthenticatedRequestContext(
  playwright: typeof import('playwright-core')
): Promise<APIRequestContext> {
  const request = await getAnonymousRequestContext(playwright);

  const response = await request.post("/api/login", {
    data: {
      username: "admin",
      password: "admin",
    },
  });

  const { accessToken } = await response.json();

  return playwright.request.newContext({
    baseURL: process.env.TEST_SERVER_BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
