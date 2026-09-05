CREATE TABLE "section_headers" (
	"section_key" varchar(50) PRIMARY KEY NOT NULL,
	"eyebrow" varchar(120),
	"title" varchar(150),
	"description" text,
	"is_visible" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smtp_settings" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"host" varchar(255),
	"port" integer DEFAULT 587,
	"user" varchar(255),
	"pass" text,
	"from_name" varchar(255),
	"from_email" varchar(255),
	"target_email" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "smtp_singleton" CHECK ("smtp_settings"."id" = 1)
);
--> statement-breakpoint
ALTER TABLE "about_section" RENAME COLUMN "image_url" TO "image_path";--> statement-breakpoint
ALTER TABLE "hero_section" ADD COLUMN "show_photo" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "hero_section" ADD COLUMN "photo_zoom" integer DEFAULT 100;