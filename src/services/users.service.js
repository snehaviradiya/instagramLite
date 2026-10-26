
const prisma = require("../db");

async function createUser(data) {
  return prisma.user.create({ data });
}

async function listUsers(options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc",
    isPrivate,
    hasPosts,
    search,
  } = options;

  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (hasPosts !== undefined) {
    where.posts = hasPosts ? { some: {} } : { none: {} };
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: order },
    }),
    prisma.user.count({ where }),
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

async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
}

async function getUserPosts(id, options = {}) {
  const page = options.page || 1;
  const limit = Math.min(options.limit || 10, 50);

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true },
  });

  if (!user) return null;

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: { authorId: Number(id) },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({
      where: { authorId: Number(id) },
    }),
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

async function updateUser(id, data) {
  return prisma.user.update({
    where: { id: Number(id) },
    data,
  });
}

async function deleteUser(id) {
  return prisma.user.delete({
    where: { id: Number(id) },
  });
}

async function getUserLikedPosts(id, options = {}) {
  const page = Number(options.page) || 1;
  const limit = Math.min(Number(options.limit) || 10, 50);

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true },
  });

  if (!user) return null;

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: {
        likes: {
          some: { userId: Number(id) },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { likes: true } },
      },
    }),
    prisma.post.count({
      where: {
        likes: {
          some: { userId: Number(id) },
        },
      },
    }),
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

module.exports = {
  createUser,
  listUsers,
  getUserById,
  getUserPosts,
  getUserLikedPosts,
  updateUser,
  deleteUser,
};