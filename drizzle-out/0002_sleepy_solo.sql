ALTER TABLE "entities" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "entities" CASCADE;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "text" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "description" SET DATA TYPE text;