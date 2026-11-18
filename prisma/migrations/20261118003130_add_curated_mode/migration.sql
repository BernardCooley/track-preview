-- AlterTable
ALTER TABLE "User" ADD COLUMN     "curatedMode" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "yearTo" SET DEFAULT extract(year from now())::int;

-- Move existing in-progress reviews to library since default is non-curated
UPDATE "Review" SET "currentReviewStep" = 4, "furthestReviewStep" = 4 WHERE "currentReviewStep" IN (2, 3);
