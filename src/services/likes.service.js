
const prisma = require("../db");

async function getPostLikes(postId) {
  return prisma.like.findMany({
    where: { postId: Number(postId) },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
    },
    orderBy: {
      user: { username: "asc" },
    },
  }).then((likes) => likes.map((like) => like.user));
}

async function addLike(postId, userId) {
  return prisma.like.create({
    data: {
      postId: Number(postId),
      userId: Number(userId),
    },
  });
}

async function removeLike(postId, userId) {
  return prisma.like.delete({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });
}

module.exports = {
  getPostLikes,
  addLike,
  removeLike,
};
