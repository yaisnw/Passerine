-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MOVIE', 'TV');

-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'DROPPED');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "watchlist_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "media_type" "MediaType" NOT NULL,
    "title" TEXT NOT NULL,
    "poster_path" TEXT NOT NULL,
    "status" "WatchStatus" NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watched_at" TIMESTAMP(3),

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("watchlist_id")
);

-- CreateTable
CREATE TABLE "Review" (
    "review_id" SERIAL NOT NULL,
    "watchlist_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT,
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_user_id_tmdb_id_media_type_key" ON "Watchlist"("user_id", "tmdb_id", "media_type");

-- CreateIndex
CREATE UNIQUE INDEX "Review_watchlist_id_key" ON "Review"("watchlist_id");

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_watchlist_id_fkey" FOREIGN KEY ("watchlist_id") REFERENCES "Watchlist"("watchlist_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Watchlist_user_id_status_idx" ON "Watchlist"("user_id", "status");

-- AddCheckConstraint
ALTER TABLE "Review" ADD CONSTRAINT "rating_range" CHECK (rating >= 1 AND rating <= 10);
