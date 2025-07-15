CREATE TABLE "archived_post_tags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"archived_post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "archived_post_tags" ADD CONSTRAINT "archived_post_tags_archived_post_id_archived_posts_id_fk" FOREIGN KEY ("archived_post_id") REFERENCES "public"."archived_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_post_tags" ADD CONSTRAINT "archived_post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_posts" DROP COLUMN "tags";