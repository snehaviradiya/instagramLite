
const prisma = require("../db");

async function createPost(data) {
  try {
    return await prisma.post.create({ data });
  } catch (error) {
    if (error.code === "P2003") {
      const notFound = new Error("User not found");
      notFound.code = "USER_NOT_FOUND";
      throw notFound;
    }
    throw error;
  }
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
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) {
      const endDate = new Date(to);
      endDate.setDate(endDate.getDate() + 1);
      where.createdAt.lt = endDate;
    }
  }

  const orderBy = sortBy === "likes"
    ? [{ likes: { _count: order } }, { createdAt: "desc" }]
    : { [sortBy]: order };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        author: {
          select: { id: true, username: true, fullname: true },
        },
        _count: {
          select: { likes: true },
        },
      },
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
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: { likes: true },
      },
    },
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
