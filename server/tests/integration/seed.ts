import { PrismaClient } from "@prisma/client";
import { copycat } from "@snaplet/copycat";

export const seed = async (dbPort: number) => {
  // Seed your database here

  const { DB_NAME, DB_USER, DB_PASSWORD } = process.env;
  const prismaClient = new PrismaClient({
    datasources: {
      db: {
        url: `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${dbPort}/${DB_NAME}`,
      },
    },
  });

  await prismaClient.$connect();

  // based on relations

  for (let i = 0; i < 10; i++) {
    await prismaClient.author.create({
      data: {
        id: copycat.uuid(`author-${i}`),
        firstName: copycat.firstName(`author-${i}`),
        lastName: copycat.lastName(`author-${i}`),
        createdAt: copycat.dateString(`author-${i}`),
        updatedAt: copycat.dateString(`author-${i}`),
        profileImage: copycat.url(`author-${i}`),
        slug: copycat.url(`author-${i}`),
        twitter: copycat.url(`author-${i}`),
      },
    });
  }

  for (let i = 0; i < 10; i++) {
    await prismaClient.post.create({
      data: {
        title: copycat.sentence(`post-${i}-title`),
        content: copycat.sentence(`post-${i}-content`),
        author: {
          create: {
            id: copycat.uuid(`post-${i}-author`),
            firstName: copycat.firstName(`post-${i}-author`),
            lastName: copycat.lastName(`post-${i}-author`),
            createdAt: copycat.dateString(`post-${i}-author`),
            updatedAt: copycat.dateString(`post-${i}-author`),
            profileImage: copycat.url(`post-${i}-author`),
            slug: copycat.url(`post-${i}-author`),
            twitter: copycat.url(`post-${i}-author`),
          },
        },
        featuredImage: copycat.url(`post-${i}`),
      },
    });
  }
};
