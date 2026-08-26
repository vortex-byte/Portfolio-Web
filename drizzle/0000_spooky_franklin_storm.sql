CREATE TABLE "about_section" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"content" text NOT NULL,
	"image_url" varchar(500),
	"image_alt" varchar(200),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "about_singleton" CHECK ("about_section"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(150) NOT NULL,
	"token_version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"ip_address" varchar(64),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "footer_section" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"copyright_text" varchar(255),
	"social_links" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "footer_singleton" CHECK ("footer_section"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "hero_section" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"cta_primary_label" varchar(60),
	"cta_primary_url" varchar(255),
	"cta_secondary_label" varchar(60),
	"cta_secondary_url" varchar(255),
	"photo_url" varchar(500),
	"photo_alt" varchar(200),
	"layout_config" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hero_singleton" CHECK ("hero_section"."id" = 1)
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_user_id" uuid NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_lockouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" varchar(255) NOT NULL,
	"identifier_type" varchar(20) NOT NULL,
	"failed_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "security_lockouts_type_check" CHECK ("security_lockouts"."identifier_type" IN ('ip', 'account'))
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"icon" varchar(100),
	"category" varchar(60),
	"proficiency" smallint,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skills_proficiency_check" CHECK ("skills"."proficiency" >= 0 AND "skills"."proficiency" <= 100)
);
--> statement-breakpoint
CREATE TABLE "visitor_daily_stats" (
	"date" date PRIMARY KEY NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"ip_hash" varchar(128),
	"visitor_id" varchar(128),
	"user_agent" varchar(255),
	"visited_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_monthly_stats" (
	"year_month" char(7) PRIMARY KEY NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "what_i_can_do_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" varchar(255) NOT NULL,
	"icon" varchar(100),
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_item_id" uuid NOT NULL,
	"image_url" varchar(500) NOT NULL,
	"image_alt" varchar(200),
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(150) NOT NULL,
	"short_description" varchar(255) NOT NULL,
	"long_description" text NOT NULL,
	"cover_image_url" varchar(500) NOT NULL,
	"cover_image_alt" varchar(200),
	"project_url" varchar(255),
	"repo_url" varchar(255),
	"is_pinned" boolean DEFAULT false NOT NULL,
	"pinned_order" smallint,
	"is_visible" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"tech_stack" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_admin_user_id_admin_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_images" ADD CONSTRAINT "work_images_work_item_id_work_items_id_fk" FOREIGN KEY ("work_item_id") REFERENCES "public"."work_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_messages_read_created_idx" ON "contact_messages" USING btree ("is_read","created_at");--> statement-breakpoint
CREATE INDEX "refresh_tokens_admin_user_id_idx" ON "refresh_tokens" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "security_lockouts_identifier_idx" ON "security_lockouts" USING btree ("identifier","identifier_type");--> statement-breakpoint
CREATE INDEX "skills_display_order_idx" ON "skills" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "skills_category_idx" ON "skills" USING btree ("category");--> statement-breakpoint
CREATE INDEX "visitor_logs_visited_at_idx" ON "visitor_logs" USING btree ("visited_at");--> statement-breakpoint
CREATE INDEX "visitor_logs_path_visited_at_idx" ON "visitor_logs" USING btree ("path","visited_at");--> statement-breakpoint
CREATE INDEX "what_i_can_do_display_order_idx" ON "what_i_can_do_items" USING btree ("display_order");--> statement-breakpoint
CREATE INDEX "work_images_work_item_order_idx" ON "work_images" USING btree ("work_item_id","display_order");--> statement-breakpoint
CREATE INDEX "work_items_visible_pinned_idx" ON "work_items" USING btree ("is_visible","is_pinned");--> statement-breakpoint
CREATE INDEX "work_items_display_order_idx" ON "work_items" USING btree ("display_order");