CREATE TABLE "coupon" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"description" text NOT NULL,
	"percent_off" smallint NOT NULL,
	"max_redemptions" integer,
	"first_booking_only" boolean DEFAULT false NOT NULL,
	"valid_until" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupon_code_unique" UNIQUE("code"),
	CONSTRAINT "coupon_percent_range" CHECK ("coupon"."percent_off" between 1 and 100)
);
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "discount_usd_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_coupon_id_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupon"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_coupon_id_index" ON "booking" USING btree ("coupon_id");