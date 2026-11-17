/*
  Warnings:

  - You are about to drop the column `genre` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "genre",
ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY['all']::TEXT[],
ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;
