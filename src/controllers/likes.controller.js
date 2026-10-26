
const prisma = require("../db");
const likesService = require("../services/likes.service");

async function getLikes(req, res) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      select: { id: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const users = await likesService.getPostLikes(req.params.id);
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function addLike(req, res) {
  const { userId } = req.body;

  if (userId === undefined || userId === null || userId === "") {
    return res.status(400).json({ error: "userId is required" });
  }

  const parsedUserId = Number(userId);
  const parsedPostId = Number(req.params.id);

  if (
    !Number.isInteger(parsedUserId) || parsedUserId < 1 ||
    !Number.isInteger(parsedPostId) || parsedPostId < 1
  ) {
    return res.status(400).json({ error: "Invalid userId or post id" });
  }

  try {
    const [user, post] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parsedUserId },
        select: { id: true },
      }),
      prisma.post.findUnique({
        where: { id: parsedPostId },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await likesService.addLike(parsedPostId, parsedUserId);
    return res.status(201).json({ message: "Liked successfully" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function removeLike(req, res) {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);

  if (
    !Number.isInteger(postId) || postId < 1 ||
    !Number.isInteger(userId) || userId < 1
  ) {
    return res.status(400).json({ error: "Invalid post id or userId" });
  }

  try {
    await likesService.removeLike(postId, userId);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }

    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getLikes,
  addLike,
  removeLike,
};
