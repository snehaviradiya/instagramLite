const prisma = require("../db");

async function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts() {
  return prisma.post.findMany();
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
  });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
};