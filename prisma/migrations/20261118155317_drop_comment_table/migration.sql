/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;

-- DropTable
DROP TABLE "Comment";
