-- Allow 0.5 as the minimum rating (half-star on the first star)
ALTER TABLE "Review" DROP CONSTRAINT "Review_rating_check";
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check" CHECK (rating >= 0.5 AND rating <= 10 AND (rating * 2) = FLOOR(rating * 2));
