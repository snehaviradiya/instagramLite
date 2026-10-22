
const prisma = require("../db");

async function createUser(data) {
  return prisma.user.create({
    data,
  });
}

async function listUsers() {
  return prisma.user.findMany();
}

module.exports = {
  createUser,
  listUsers,
};
