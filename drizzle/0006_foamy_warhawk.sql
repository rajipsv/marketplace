CREATE TYPE "public"."earning_status" AS ENUM('held', 'payable', 'paid', 'reversed');--> statement-breakpoint
CREATE TABLE "coach_earning" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"coach_id" uuid NOT NULL,
	"list_inr_paise" integer NOT NULL,
	"paid_inr_paise" integer NOT NULL,
	"base_inr_paise" integer NOT NULL,
	"commission_pct" smallint NOT NULL,
	"commission_inr_paise" integer NOT NULL,
	"coach_share_inr_paise" integer NOT NULL,
	"status" "earning_status" DEFAULT 'held' NOT NULL,
	"available_at" timestamp with time zone NOT NULL,
	"payout_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coach_earning_bookingId_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
CREATE TABLE "setting" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coach" ADD COLUMN "agreement_accepted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "coach_earning" ADD CONSTRAINT "coach_earning_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_earning" ADD CONSTRAINT "coach_earning_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_earning" ADD CONSTRAINT "coach_earning_payout_id_payout_id_fk" FOREIGN KEY ("payout_id") REFERENCES "public"."payout"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coach_earning_coach_id_status_index" ON "coach_earning" USING btree ("coach_id","status");--> statement-breakpoint
CREATE INDEX "coach_earning_payout_id_index" ON "coach_earning" USING btree ("payout_id");