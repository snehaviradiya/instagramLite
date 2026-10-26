
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
    search,
  } = options;

  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullname: { contains: search, mode: "insensitive" } },
    ];
  }

  const data = await prisma.user.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: order },
  });

  const total = await prisma.user.count({ where });

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
  });
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

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
