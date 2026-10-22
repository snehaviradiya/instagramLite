const prisma = require("../db");

async function createPost(data) {
  return prisma.post.create({ data });
}

module.exports = { createPost };