-- Make user_id nullable in posts and comments tables
ALTER TABLE "posts" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "comments" ALTER COLUMN "user_id" DROP NOT NULL;
