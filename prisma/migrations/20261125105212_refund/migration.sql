-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionStartedAt" TIMESTAMP(3),
ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;
