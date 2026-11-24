-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email" TEXT,
ADD COLUMN     "genreAlertFrequency" "AlertFrequency" NOT NULL DEFAULT 'WEEKLY',
ADD COLUMN     "genreAlerts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;
