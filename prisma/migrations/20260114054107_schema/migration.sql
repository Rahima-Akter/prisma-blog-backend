/*
  Warnings:

  - You are about to drop the `Comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_commentParentId_fkey";

-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_postId_fkey";

-- DropTable
DROP TABLE "Comments";

-- DropTable
DROP TABLE "posts";

-- DropEnum
DROP TYPE "CommentStatus";

-- DropEnum
DROP TYPE "PostStatus";
