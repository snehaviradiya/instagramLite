
const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    })),
  });

  const userIds = new Map(
    createdUsers.map((user) => [user.username, user.id])
  );

  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((post) => ({
      ...post,
      createdAt: new Date(post.createdAt),
    })),
  });

  console.log(
    `🌱 Seeded ${createdUsers.length} users and ${createdPosts.length} posts`
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
