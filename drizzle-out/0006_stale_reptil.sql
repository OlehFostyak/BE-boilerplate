CREATE TABLE "archived_comments" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"original_id" uuid NOT NULL,
	"text" text NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"archived_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "archived_posts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"original_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"archived_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "archived_post_tags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"post_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"archived_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "archived_tags" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"original_id" uuid NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"archived_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "archived_comments" ADD CONSTRAINT "archived_comments_post_id_archived_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."archived_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_comments" ADD CONSTRAINT "archived_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_posts" ADD CONSTRAINT "archived_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_post_tags" ADD CONSTRAINT "archived_post_tags_post_id_archived_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."archived_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "archived_post_tags" ADD CONSTRAINT "archived_post_tags_tag_id_archived_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."archived_tags"("id") ON DELETE cascade ON UPDATE no action;