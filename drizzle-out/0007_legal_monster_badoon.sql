-- Convert text fields to jsonb with proper casting for archived_users table
ALTER TABLE "archived_users" ALTER COLUMN "user_data" SET DATA TYPE jsonb USING "user_data"::jsonb;--> statement-breakpoint
ALTER TABLE "archived_users" ALTER COLUMN "posts_data" SET DATA TYPE jsonb USING CASE WHEN "posts_data" IS NULL THEN NULL ELSE "posts_data"::jsonb END;--> statement-breakpoint
ALTER TABLE "archived_users" ALTER COLUMN "comments_on_posts_data" SET DATA TYPE jsonb USING CASE WHEN "comments_on_posts_data" IS NULL THEN NULL ELSE "comments_on_posts_data"::jsonb END;--> statement-breakpoint
ALTER TABLE "archived_users" ALTER COLUMN "user_comments_data" SET DATA TYPE jsonb USING CASE WHEN "user_comments_data" IS NULL THEN NULL ELSE "user_comments_data"::jsonb END;