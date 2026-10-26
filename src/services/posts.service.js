
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
    from,
    to,
  } = options;

  const where = {};

  if (location) {
    where.location = {
      equals: location,
      mode: "insensitive",
    };
  }

  if (search) {
    where.caption = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (from || to) {
    where.createdAt = {};

    if (from) {
      where.createdAt.gte = new Date(from);
    }

    if (to) {
      where.createdAt.lt = new Date(to);
    }
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.post.count({ where }),
  ]);

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
