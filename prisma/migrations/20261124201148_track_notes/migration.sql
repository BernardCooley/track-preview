-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;
