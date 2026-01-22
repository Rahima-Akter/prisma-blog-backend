import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { postRouter } from "./modules/posts/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { commentRouter } from "./modules/comments/comment.router";
import { userRouter } from "./modules/users/user.router";
const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:3000"],
  }),
);

app.use(express.json());

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/post", postRouter);
app.use("/comments", commentRouter);
app.use("/users", userRouter);

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
