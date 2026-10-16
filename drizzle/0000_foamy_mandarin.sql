CREATE TYPE "public"."user_role" AS ENUM('customer', 'coach', 'admin');--> statement-breakpoint
CREATE TYPE "public"."audience" AS ENUM('adults', 'kids', 'family');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('pending_payment', 'confirmed', 'cancelled', 'refunded', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."coach_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."offering_badge" AS ENUM('Most loved', 'Free trial', 'Festival', 'New');--> statement-breakpoint
CREATE TYPE "public"."offering_format" AS ENUM('group', 'one-on-one', 'weekly-class');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('razorpay', 'paypal');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('created', 'authorized', 'captured', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('scheduled', 'live', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"phone" text,
	"timezone" text DEFAULT 'America/New_York' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_exception" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid NOT NULL,
	"date" date NOT NULL,
	"is_available" boolean DEFAULT false NOT NULL,
	"start_minute" smallint,
	"end_minute" smallint
);
--> statement-breakpoint
CREATE TABLE "availability_rule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid NOT NULL,
	"weekday" smallint NOT NULL,
	"start_minute" smallint NOT NULL,
	"end_minute" smallint NOT NULL,
	CONSTRAINT "availability_weekday_range" CHECK ("availability_rule"."weekday" between 0 and 6),
	CONSTRAINT "availability_window" CHECK ("availability_rule"."start_minute" >= 0 and "availability_rule"."end_minute" <= 1440 and "availability_rule"."start_minute" < "availability_rule"."end_minute")
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"customer_user_id" text NOT NULL,
	"family_member_id" uuid,
	"status" "booking_status" DEFAULT 'pending_payment' NOT NULL,
	"price_usd_cents" integer NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"blurb" text NOT NULL,
	"icon" text NOT NULL,
	"examples" text[] DEFAULT '{}'::text[] NOT NULL,
	"sort_order" smallint DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "class_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offering_id" uuid NOT NULL,
	"coach_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"capacity" smallint DEFAULT 1 NOT NULL,
	"status" "session_status" DEFAULT 'scheduled' NOT NULL,
	"video_room_id" text,
	"recording_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_time_order" CHECK ("class_session"."starts_at" < "class_session"."ends_at")
);
--> statement-breakpoint
CREATE TABLE "coach" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"title" text NOT NULL,
	"bio" text,
	"city" text NOT NULL,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"years_experience" smallint DEFAULT 0 NOT NULL,
	"timezone" text DEFAULT 'Asia/Kolkata' NOT NULL,
	"status" "coach_status" DEFAULT 'pending' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"photo_key" text,
	"intro_video_key" text,
	"payouts_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coach_userId_unique" UNIQUE("user_id"),
	CONSTRAINT "coach_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coach_category" (
	"coach_id" uuid NOT NULL,
	"category_slug" text NOT NULL,
	CONSTRAINT "coach_category_coach_id_category_slug_pk" PRIMARY KEY("coach_id","category_slug")
);
--> statement-breakpoint
CREATE TABLE "credential" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid NOT NULL,
	"title" text NOT NULL,
	"issuer" text,
	"year" smallint,
	"document_key" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "family_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_user_id" text NOT NULL,
	"name" text NOT NULL,
	"birth_year" smallint,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offering" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid NOT NULL,
	"category_slug" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"format" "offering_format" NOT NULL,
	"audience" "audience" DEFAULT 'adults' NOT NULL,
	"duration_min" smallint NOT NULL,
	"price_usd_cents" integer NOT NULL,
	"capacity" smallint DEFAULT 1 NOT NULL,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"badge" "offering_badge",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "offering_slug_unique" UNIQUE("slug"),
	CONSTRAINT "offering_price_nonnegative" CHECK ("offering"."price_usd_cents" >= 0),
	CONSTRAINT "offering_duration_positive" CHECK ("offering"."duration_min" > 0)
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"provider" "payment_provider" NOT NULL,
	"provider_order_id" text NOT NULL,
	"provider_payment_id" text,
	"amount_usd_cents" integer NOT NULL,
	"status" "payment_status" DEFAULT 'created' NOT NULL,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_providerPaymentId_unique" UNIQUE("provider_payment_id")
);
--> statement-breakpoint
CREATE TABLE "payout" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"gross_inr_paise" integer NOT NULL,
	"tds_inr_paise" integer DEFAULT 0 NOT NULL,
	"net_inr_paise" integer NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"provider_payout_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payout_providerPayoutId_unique" UNIQUE("provider_payout_id")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"coach_id" uuid NOT NULL,
	"customer_user_id" text NOT NULL,
	"rating" smallint NOT NULL,
	"comment" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_bookingId_unique" UNIQUE("booking_id"),
	CONSTRAINT "review_rating_range" CHECK ("review"."rating" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_exception" ADD CONSTRAINT "availability_exception_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_rule" ADD CONSTRAINT "availability_rule_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_session_id_class_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_session"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_customer_user_id_user_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_family_member_id_family_member_id_fk" FOREIGN KEY ("family_member_id") REFERENCES "public"."family_member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_session" ADD CONSTRAINT "class_session_offering_id_offering_id_fk" FOREIGN KEY ("offering_id") REFERENCES "public"."offering"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_session" ADD CONSTRAINT "class_session_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach" ADD CONSTRAINT "coach_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_category" ADD CONSTRAINT "coach_category_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_category" ADD CONSTRAINT "coach_category_category_slug_category_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."category"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credential" ADD CONSTRAINT "credential_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "family_member" ADD CONSTRAINT "family_member_parent_user_id_user_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering" ADD CONSTRAINT "offering_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offering" ADD CONSTRAINT "offering_category_slug_category_slug_fk" FOREIGN KEY ("category_slug") REFERENCES "public"."category"("slug") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout" ADD CONSTRAINT "payout_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_coach_id_coach_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_customer_user_id_user_id_fk" FOREIGN KEY ("customer_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_index" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_index" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_index" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "availability_exception_coach_id_date_index" ON "availability_exception" USING btree ("coach_id","date");--> statement-breakpoint
CREATE INDEX "availability_rule_coach_id_index" ON "availability_rule" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "booking_customer_user_id_index" ON "booking" USING btree ("customer_user_id");--> statement-breakpoint
CREATE INDEX "booking_session_id_index" ON "booking" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "class_session_coach_id_starts_at_index" ON "class_session" USING btree ("coach_id","starts_at");--> statement-breakpoint
CREATE INDEX "class_session_starts_at_index" ON "class_session" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "coach_status_index" ON "coach" USING btree ("status");--> statement-breakpoint
CREATE INDEX "credential_coach_id_index" ON "credential" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "family_member_parent_user_id_index" ON "family_member" USING btree ("parent_user_id");--> statement-breakpoint
CREATE INDEX "offering_coach_id_index" ON "offering" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "offering_category_slug_index" ON "offering" USING btree ("category_slug");--> statement-breakpoint
CREATE INDEX "payment_booking_id_index" ON "payment" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_provider_provider_order_id_index" ON "payment" USING btree ("provider","provider_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payout_coach_id_period_start_period_end_index" ON "payout" USING btree ("coach_id","period_start","period_end");--> statement-breakpoint
CREATE INDEX "review_coach_id_index" ON "review" USING btree ("coach_id");