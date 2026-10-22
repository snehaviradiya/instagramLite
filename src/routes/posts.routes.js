const express = require("express");
const postsController = require("../controllers/posts.controller");

const router = express.Router();

router.post("/", postsController.create);
router.get("/", postsController.list);

module.exports = router;