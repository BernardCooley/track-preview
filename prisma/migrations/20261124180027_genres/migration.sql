-- AlterTable
ALTER TABLE "User" ADD COLUMN     "genreEmailsEnabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;
