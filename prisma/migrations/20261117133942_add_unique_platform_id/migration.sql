/*
  Warnings:

  - You are about to drop the column `currentReviewStep` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `furthestReviewStep` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `searchedTrackId` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the `SearchedTrack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoredTrack` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[platformId]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Track` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `platform` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformId` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `previewUrl` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseDate` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseTitle` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseYear` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Track` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_searchedTrackId_fkey";

-- DropForeignKey
ALTER TABLE "Track" DROP CONSTRAINT "Track_userId_fkey";

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "currentReviewStep",
DROP COLUMN "furthestReviewStep",
DROP COLUMN "searchedTrackId",
DROP COLUMN "userId",
ADD COLUMN     "deezerTrackId" TEXT,
ADD COLUMN     "platform" TEXT NOT NULL,
ADD COLUMN     "platformId" TEXT NOT NULL,
ADD COLUMN     "previewUrl" TEXT NOT NULL,
ADD COLUMN     "releaseDate" TEXT NOT NULL,
ADD COLUMN     "releaseTitle" TEXT NOT NULL,
ADD COLUMN     "releaseYear" INTEGER NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "autoplay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "genre" TEXT NOT NULL DEFAULT 'all',
ADD COLUMN     "yearFrom" INTEGER NOT NULL DEFAULT 1960,
ADD COLUMN     "yearTo" INTEGER NOT NULL DEFAULT extract(year from now())::int;

-- DropTable
DROP TABLE "SearchedTrack";

-- DropTable
DROP TABLE "StoredTrack";

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "replied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "currentReviewStep" INTEGER NOT NULL,
    "furthestReviewStep" INTEGER NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_trackId_key" ON "Review"("userId", "trackId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_platformId_key" ON "Track"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
