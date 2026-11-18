/*
  Warnings:

  - You are about to drop the column `previewUrl` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Track` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Track_slug_key";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "previewUrl",
DROP COLUMN "slug",
DROP COLUMN "url";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;
