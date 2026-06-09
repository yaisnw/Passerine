-- Drop old 1-5 scale constraint
ALTER TABLE "Review" DROP CONSTRAINT "Review_rating_check";

-- Convert existing ratings from 1-5 to 1-10 scale
UPDATE "Review" SET "rating" = "rating" * 2;

-- Add new 1-10 scale constraint (whole numbers only)
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check" CHECK (rating >= 1 AND rating <= 10 AND rating = FLOOR(rating));
