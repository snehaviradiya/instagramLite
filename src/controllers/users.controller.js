
const usersService = require("../services/users.service");

async function create(req, res) {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  try {
    const user = await usersService.createUser({
      username,
      email,
      fullname,
      ...(bio !== undefined ? { bio } : {}),
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "username or email already taken",
      });
    }

    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

async function list(req, res) {
  try {
    const users = await usersService.listUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


async function getOne(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


async function update(req, res) {
  const { fullname, bio, isPrivate } = req.body;

  // Only allow the fields specified by the lab
  const data = {};

  if (fullname !== undefined) data.fullname = fullname;
  if (bio !== undefined) data.bio = bio;
  if (isPrivate !== undefined) data.isPrivate = isPrivate;

  try {
    const user = await usersService.updateUser(
      req.params.id,
      data
    );

    return res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "User not found",
      });
    }

    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


module.exports = {
  create,
  list,
  getOne,
  update,
};