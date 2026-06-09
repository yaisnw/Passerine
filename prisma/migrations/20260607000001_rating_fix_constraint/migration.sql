-- Fix constraint to allow 0.5 increments on 1-10 scale
ALTER TABLE "Review" DROP CONSTRAINT "Review_rating_check";
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_check" CHECK (rating >= 1 AND rating <= 10 AND (rating * 2) = FLOOR(rating * 2));
