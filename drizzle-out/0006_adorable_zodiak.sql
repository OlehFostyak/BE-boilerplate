CREATE TABLE "archived_users" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"original_user_id" uuid NOT NULL,
	"user_data" text NOT NULL,
	"posts_data" text,
	"comments_on_posts_data" text,
	"user_comments_data" text,
	"archived_at" timestamp DEFAULT now(),
	"archived_by" uuid NOT NULL
);
