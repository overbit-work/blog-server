import { test, expect, APIRequestContext } from "@playwright/test";
import { getAuthenticatedRequestContext } from "../auth/global.request-authenticated";

// Request context is reused by all tests in the file.
let apiRequest: APIRequestContext;

test.describe("REST posts", () => {
  test.beforeAll(async ({ playwright }) => {
    apiRequest = await getAuthenticatedRequestContext(playwright);
  });

  test.afterAll(async ({}) => {
    // Dispose all responses.
    await apiRequest.dispose();
  });

  test.beforeEach(async () => {});
  test.afterEach(async () => {});

  test("should create a post", async () => {
    const newPost = await apiRequest.post("/api/posts/", {
      data: {
        content: "content string",
        draft: true,
        featuredImage: "featuredImage string",
        metaDescription: "metaDescription string",
        metaTitle: "metaTitle string",
        slug: "slug string",
        title: "title string"
      },
    });
    expect(newPost.ok()).toBeTruthy();

    expect(newPost.json()).toEqual({
      content: "content string",
      draft: true,
      featuredImage: "featuredImage string",
      metaDescription: "metaDescription string",
      metaTitle: "metaTitle string",
      publishedAt: {},
      slug: "slug string",
      tags: {},
      title: "title string"
    });
  });

  test("should read a post", async () => {});

  test("should update a post", async () => {});

  test("should delete a post", async () => {});
});
