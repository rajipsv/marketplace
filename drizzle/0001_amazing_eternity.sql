CREATE TYPE "public"."request_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TABLE "class_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"offering_id" uuid,
	"subject" text,
	"for_whom" text,
	"preferred_times" text,
	"message" text,
	"timezone" text,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_request" ADD CONSTRAINT "class_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_request" ADD CONSTRAINT "class_request_offering_id_offering_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."offering"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "class_request_status_created_at_index" ON "class_request" USING btree ("status","created_at");