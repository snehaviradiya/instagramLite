
const express = require("express");
const postsController = require("../controllers/posts.controller");
const likesController = require("../controllers/likes.controller");

const router = express.Router();

router.post("/", postsController.create);

// Like routes must come before /:id
router.get("/:id/likes", likesController.getLikes);
router.post("/:id/likes", likesController.addLike);
router.delete("/:id/likes/:userId", likesController.removeLike);

router.get("/", postsController.list);
router.get("/:id", postsController.getOne);
router.patch("/:id", postsController.update);
router.delete("/:id", postsController.remove);

module.exports = router;
