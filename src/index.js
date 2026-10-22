
const express = require("express");
const usersRouter = require("./routes/users.routes");
const postsRouter = require("./routes/posts.routes");

const app = express();

app.use(express.json());
app.use("/posts", postsRouter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Mount the users router
app.use("/users", usersRouter);

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
