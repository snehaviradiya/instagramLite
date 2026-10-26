
const prisma = require("../db");

async function createPost(data) {
  return prisma.post.create({ data });
}

async function listPosts(options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    location,
    search,
    startDate,
    endDate,
  } = options;

  const where = {};

  if (location) {
    where.location = {
      contains: location,
      mode: "insensitive",
    };
  }

  if (search) {
    where.OR = [
      { caption: { contains: search, mode: "insensitive" } },
      { location: { contains: search, mode: "insensitive" } },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }

    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const data = await prisma.post.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: order },
  });

  const total = await prisma.post.count({ where });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id: Number(id) },
  });
}

async function updatePost(id, data) {
  return prisma.post.update({
    where: { id: Number(id) },
    data,
  });
}

async function deletePost(id) {
  return prisma.post.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
