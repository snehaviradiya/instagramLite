
const postsService = require("../services/posts.service");

async function create(req, res) {
  const { imageUrl, caption, location } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  try {
    const post = await postsService.createPost({
      imageUrl,
      ...(caption !== undefined ? { caption } : {}),
      ...(location !== undefined ? { location } : {}),
    });

    return res.status(201).json(post);
  } catch (error) {
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
    location,
    search,
    from,
    to,
  } = req.query;

  const page = rawPage === undefined ? 1 : Number(rawPage);
  const requestedLimit = rawLimit === undefined ? 10 : Number(rawLimit);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  const limit = Math.min(requestedLimit, 50);
  const sortBy = rawSortBy || "createdAt";
  const order = rawOrder || "desc";

  if (!["createdAt", "updatedAt"].includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

const isValidDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;

  if (
    (from !== undefined && !isValidDate(from)) ||
    (to !== undefined && !isValidDate(to))
  ) {
    return res.status(400).json({
      error: "from and to must be valid dates",
    });
  }

  try {
    const result = await postsService.listPosts({
      page,
      limit,
      sortBy,
      order,
      location,
      search,
      from,
      to,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getOne(req, res) {
  try {
    const post = await postsService.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function update(req, res) {
  const data = {};
  const { caption, location } = req.body;

  if (caption !== undefined) data.caption = caption;
  if (location !== undefined) data.location = location;

  try {
    const post = await postsService.updatePost(req.params.id, data);
    return res.status(200).json(post);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function remove(req, res) {
  try {
    await postsService.deletePost(req.params.id);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
