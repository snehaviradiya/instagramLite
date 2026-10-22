const postsService = require("../services/posts.service");

async function create(req, res) {
  const { imageUrl, caption, location } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      error: "imageUrl is required",
    });
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
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

async function list(req, res) {
  try {
    const posts = await postsService.listPosts();
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  create,
  list,
};