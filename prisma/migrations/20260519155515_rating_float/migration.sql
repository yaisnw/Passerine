-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION;

-- AddCheckConstraint
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check" CHECK (rating >= 1 AND rating <= 5 AND (rating * 2) = FLOOR(rating * 2));
