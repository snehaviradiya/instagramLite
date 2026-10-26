
const usersService = require("../services/users.service");

async function create(req, res) {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  try {
    const data = { username, email, fullname };

    if (bio !== undefined) data.bio = bio;

    const user = await usersService.createUser(data);
    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "username or email already taken",
      });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function list(req, res) {
  const {
    page: rawPage,
    limit: rawLimit,
    sortBy: rawSortBy,
    order: rawOrder,
    isPrivate: rawIsPrivate,
    hasPosts: rawHasPosts,
    search,
  } = req.query;

  const page = rawPage === undefined ? 1 : Number(rawPage);
  const requestedLimit =
    rawLimit === undefined ? 10 : Number(rawLimit);

  if (
    !Number.isInteger(page) || page < 1 ||
    !Number.isInteger(requestedLimit) || requestedLimit < 1
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  const limit = Math.min(requestedLimit, 50);
  const sortBy = rawSortBy || "createdAt";
  const order = rawOrder || "desc";

  if (!["createdAt", "username", "fullname"].includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, username, fullname",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  let isPrivate;
  let hasPosts;

  if (rawIsPrivate !== undefined) {
    if (!["true", "false"].includes(rawIsPrivate)) {
      return res.status(400).json({
        error: "isPrivate must be true or false",
      });
    }
    isPrivate = rawIsPrivate === "true";
  }

  if (rawHasPosts !== undefined) {
    if (!["true", "false"].includes(rawHasPosts)) {
      return res.status(400).json({
        error: "hasPosts must be true or false",
      });
    }
    hasPosts = rawHasPosts === "true";
  }

  try {
    const result = await usersService.listUsers({
      page,
      limit,
      sortBy,
      order,
      isPrivate,
      hasPosts,
      search,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getPosts(req, res) {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (
    !Number.isInteger(page) || page < 1 ||
    !Number.isInteger(limit) || limit < 1
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  try {
    const result = await usersService.getUserPosts(req.params.id, {
      page,
      limit,
    });

    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const data = {};
  const { fullname, bio, isPrivate } = req.body;

  if (fullname !== undefined) data.fullname = fullname;
  if (bio !== undefined) data.bio = bio;
  if (isPrivate !== undefined) data.isPrivate = isPrivate;

  try {
    const user = await usersService.updateUser(req.params.id, data);
    return res.status(200).json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  try {
    await usersService.deleteUser(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getLikedPosts(req, res) {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (
    !Number.isInteger(page) || page < 1 ||
    !Number.isInteger(limit) || limit < 1
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  try {
    const result = await usersService.getUserLikedPosts(req.params.id, {
      page,
      limit,
    });

    if (result === null) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
  getOne,
  getPosts,
  getLikedPosts,
  update,
  remove,
};