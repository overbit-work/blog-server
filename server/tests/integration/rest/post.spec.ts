import { test, expect, APIRequestContext } from "@playwright/test";
import { getAuthenticatedRequestContext } from "../auth/global.request-authenticated";
import { PostCreateInput } from "../../../src/post/base/PostCreateInput";
import { PostUpdateInput } from "../../../src/post/base/PostUpdateInput";
import { Post } from "../../../src/post/base/Post";

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

  test("should create, read, update and delete a post", async () => {
    // step 1: create an author
    const newAuthor = await apiRequest.post("/api/authors/", {
      data: {
        firstName: "firstName string",
        lastName: "lastName string",
        profileImage: "profileImage string",
        slug: "slug string",
        twitter: "twitter string",
      },
    });
    expect(newAuthor.status(), "POST author status").toEqual(201);
    const author = await newAuthor.json();
    expect(author, "POST author body").toEqual({
      firstName: "firstName string",
      lastName: "lastName string",
      profileImage: "profileImage string",
      slug: "slug string",
      twitter: "twitter string",
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    // step 2: create a post
    const newPost = await apiRequest.post("/api/posts/", {
      data: <PostCreateInput>{
        content: "content string",
        draft: true,
        featuredImage: "featuredImage string",
        metaDescription: "metaDescription string",
        metaTitle: "metaTitle string",
        slug: "slug string",
        title: "title string",
        author: {
          id: author.id,
        },
      },
    });

    expect(newPost.status(), "POST posts status").toBe(201);
    const postCreated: Post = await newPost.json();
    expect(postCreated, "POST posts body").toEqual({
      content: "content string",
      draft: true,
      featuredImage: "featuredImage string",
      metaDescription: "metaDescription string",
      metaTitle: "metaTitle string",
      slug: "title-string",
      title: "title string",
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      publishedAt: expect.any(String),
      author: {
        id: author.id,
      },
    });

    // step 3: read the post
    const readPost = await apiRequest.get(`/api/posts/${postCreated.id}`);
    expect(readPost.ok(), "GET posts/:id status").toBeTruthy();
    const postRead: Post = await readPost.json();
    expect(postRead, "GET posts/:id body").toEqual({
      content: "content string",
      draft: true,
      featuredImage: "featuredImage string",
      metaDescription: "metaDescription string",
      metaTitle: "metaTitle string",
      slug: "title-string",
      title: "title string",
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      publishedAt: expect.any(String),
      author: {
        id: author.id,
      },
    });

    // step 4: update the post
    const updatePost = await apiRequest.patch(`/api/posts/${postRead.id}`, {
      data: <PostUpdateInput>{
        content: "new content",
        draft: false,
        slug: "new-title-string",
        title: "new title string",
      },
    });
    expect(updatePost.ok(), "PATCH posts/:id status").toBeTruthy();
    const postUpdated: Post = await updatePost.json();
    expect(postUpdated, "PATCH posts/:id body").toEqual({
      content: "new content",
      draft: false,
      featuredImage: "featuredImage string",
      metaDescription: "metaDescription string",
      metaTitle: "metaTitle string",
      slug: "new-title-string",
      title: "new title string",
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      publishedAt: expect.any(String),
      author: {
        id: author.id,
      },
    });

    // step 5: delete the post
    const deletePost = await apiRequest.delete(`/api/posts/${postRead.id}`);
    expect(deletePost.ok(), "DELETE posts/:id status").toBeTruthy();

    // step 6: read the posts to verify it was deleted
    const readPosts = await apiRequest.get("/api/posts/");
    expect(readPosts.ok(), "GET posts/ status").toBeTruthy();
    const posts: Post[] = await readPosts.json();
    expect(posts, "GET posts/ body").not.toContain(postRead);
  });
});
