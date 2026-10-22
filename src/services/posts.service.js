const prisma = require("../db");

async function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts() {
  return prisma.post.findMany();
}

module.exports = {
  createPost,
  listPosts,
};