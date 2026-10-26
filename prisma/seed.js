
const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  // 1. Delete child records before parent records
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users and retrieve their generated IDs
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    })),
  });

  // 3. Map username -> user ID
  const userIds = new Map(
    createdUsers.map((user) => [user.username, user.id])
  );

  // 4. Create posts with their real author IDs
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((post) => {
      const { author, imageUrl, createdAt, ...rest } = post;

      return {
        ...rest,
        imageUrl,
        authorId: userIds.get(author),
        createdAt: new Date(createdAt),
      };
    }),
  });

  // 5. Map insta## -> post ID
  const postIds = new Map(
    createdPosts.map((post) => {
      const instaKey = post.imageUrl.split("/")[4];
      return [instaKey, post.id];
    })
  );

  // 6. Create likes with real user and post IDs
  const createdLikes = await prisma.like.createMany({
    data: likes.map((like) => ({
      userId: userIds.get(like.user),
      postId: postIds.get(like.post),
    })),
  });

  // 7. Print counts returned by Prisma
  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
