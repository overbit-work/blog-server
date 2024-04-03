import { test, expect, APIRequestContext } from "@playwright/test";
import { getAuthenticatedRequestContext } from "../auth/global.request-authenticated";
import { CreateAuthorArgs } from "../../../src/author/base/CreateAuthorArgs";
import { CreatePostArgs } from "../../../src/post/base/CreatePostArgs";
import { UpdatePostArgs } from "../../../src/post/base/UpdatePostArgs";
import { DeletePostArgs } from "../../../src/post/base/DeletePostArgs";

// Request context is reused by all tests in the file.
let apiRequest: APIRequestContext;

test.describe("GRAPHQL posts", () => {
  test.beforeAll(async ({ playwright }) => {
    apiRequest = await getAuthenticatedRequestContext(playwright);
  });

  test.afterAll(async ({}) => {
    // Dispose all responses.
    await apiRequest.dispose();
  });

  test.beforeEach(async () => {});
  test.afterEach(async () => {});

  test("should create, read, update and delete a new post", async () => {
    // step 1: create an author
    const newAuthor = await apiRequest.post("/graphql", {
      data: {
        query: `
        mutation createAuthor($data: AuthorCreateInput!){
          createAuthor(data: $data) {
            id
            firstName
            lastName
          }
        }`,
        variables: <CreateAuthorArgs>{
          data: {
            firstName: "firstName string",
            lastName: "lastName string",
            profileImage: "profileImage string",
            slug: "gql-another slug author",
            twitter: "twitter string",
          },
        },
      },
    });
    const author = await newAuthor.json();
    expect(author, "execute author mutation").toEqual({
      data: {
        createAuthor: {
          firstName: "firstName string",
          lastName: "lastName string",
          id: expect.any(String),
        },
      },
    });

    // step 2: create a post
    const newPost = await apiRequest.post("/graphql", {
      data: {
        query: `
        mutation createPost($data: PostCreateInput!){
          createPost(data: $data) {
            id
            content
            draft
            featuredImage
            metaDescription
            metaTitle
            slug
            title
            author {
              id
            }
          }
        }`,
        variables: <CreatePostArgs>{
          data: {
            content: "content string",
            draft: true,
            featuredImage: "featuredImage string",
            metaDescription: "metaDescription string",
            metaTitle: "gql metaTitle string",
            slug: "gql-title-string",
            title: "gql title string",
            author: {
              id: author.data.createAuthor.id,
            },
          },
        },
      },
    });
    const postCreated = await newPost.json();
    expect(postCreated, "execute post create mutation").toEqual({
      data: {
        createPost: {
          content: "content string",
          draft: true,
          featuredImage: "featuredImage string",
          metaDescription: "metaDescription string",
          metaTitle: "gql metaTitle string",
          slug: "gql-title-string",
          title: "gql title string",
          id: expect.any(String),
          author: {
            id: author.data.createAuthor.id,
          },
        },
      },
    });

    // step 3: read the post
    const readPost = await apiRequest.post("/graphql", {
      data: {
        query: `
        query post($where: PostWhereUniqueInput!){
          post(where: $where) {
            id
            content
            draft
            featuredImage
            metaDescription
            metaTitle
            slug
            title
            author {
              id
            }
          }
        }`,
        variables: {
          where: {
            id: postCreated.data.createPost.id,
          },
        },
      },
    });

    const readPostData = await readPost.json();
    expect(readPostData, "execute post query").toEqual({
      data: {
        post: {
          content: "content string",
          draft: true,
          featuredImage: "featuredImage string",
          metaDescription: "metaDescription string",
          metaTitle: "gql metaTitle string",
          slug: "gql-title-string",
          title: "gql title string",
          id: expect.any(String),
          author: {
            id: author.data.createAuthor.id,
          },
        },
      },
    });

    // step 4: update the post
    const updatePost = await apiRequest.post("/graphql", {
      data: {
        query: `
        mutation updatePost($data: PostUpdateInput!, $where: PostWhereUniqueInput!){
          updatePost(data: $data, where: $where) {
            content
            title
            slug
          }
        }`,
        variables: <UpdatePostArgs>{
          data: {
            content: "new content",
            slug: "gql-new-title-string",
            title: "gql new title string",
          },
          where: {
            id: postCreated.data.createPost.id,
          },
        },
      },
    });
    const postUpdated = await updatePost.json();
    expect(postUpdated, "execute post update mutation").toEqual({
      data: {
        updatePost: {
          content: "new content",
          slug: "gql-new-title-string",
          title: "gql new title string",
        },
      },
    });

    // step 5: delete the post
    const deletePost = await apiRequest.post("/graphql", {
      data: {
        query: `
        mutation deletePost($where: PostWhereUniqueInput!){
          deletePost(where: $where) {
            id
            title
          }
        }`,
        variables: <DeletePostArgs>{
          where: {
            id: postCreated.data.createPost.id,
          },
        },
      },
    });
    const postDeleted = await deletePost.json();
    expect(postDeleted, "execute post delete mutation").toEqual({
      data: {
        deletePost: {
          id: postCreated.data.createPost.id,
          title: "gql new title string",
        },
      },
    });

    // step 5: read the posts to verify it was deleted
    const readPosts = await apiRequest.post("/graphql", {
      data: {
        query: `
        query posts {
          posts {
            id
          }
        }`,
      },
    });
    const posts = await readPosts.json();
    expect(posts, "query posts").not.toContain(postCreated.data.createPost);
  });
});
