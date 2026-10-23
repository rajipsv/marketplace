CREATE TYPE "public"."payout_method" AS ENUM('bank', 'upi');--> statement-breakpoint
CREATE TABLE "coach_payout_account" (
	"coach_id" uuid PRIMARY KEY NOT NULL,
	"method" "payout_method" NOT NULL,
	"account_holder_name" text NOT NULL,
	"bank_account_enc" text,
	"bank_account_last4" text,
	"ifsc" text,
	"upi_enc" text,
	"upi_hint" text,
	"pan_enc" text NOT NULL,
	"pan_last4" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coach_payout_account" ADD CONSTRAINT "coach_payout_account_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;