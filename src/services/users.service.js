
const prisma = require("../db");

async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

async function listUsers() {
  return prisma.user.findMany();
}


async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
  });
}


module.exports = {
  createUser,
  listUsers,
  getUserById,
};
