/*
  Warnings:

  - Added the required column `releaseYear` to the `SearchedTrack` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SearchedTrack" ADD COLUMN     "releaseYear" INTEGER NOT NULL;
