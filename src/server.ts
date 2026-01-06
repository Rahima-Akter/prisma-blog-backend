import express from "express";
import { prisma } from "./lib/prisma";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Error starting the server:", err);
  }
}

main();