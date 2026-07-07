-- Drop leftover constraint from the original schema that was never removed
-- when rating validation moved to Review_rating_check. It still enforced
-- rating >= 1, blocking valid 0.5 ratings.
ALTER TABLE "Review" DROP CONSTRAINT IF EXISTS "rating_range";
