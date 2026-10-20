-- Switch prices to INR (step A): add paise columns, backfill, then require them.
ALTER TABLE "offering" DROP CONSTRAINT "offering_price_nonnegative";--> statement-breakpoint
ALTER TABLE "offering" ADD COLUMN "price_inr_paise" integer;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "price_inr_paise" integer;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "discount_inr_paise" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "amount_inr_paise" integer;--> statement-breakpoint
-- Founding teachers' agreed INR prices; anything else converted at ~₹85 per $1.
UPDATE "offering" SET "price_inr_paise" = CASE "slug"
  WHEN 'chess-coaching-with-sharan' THEN 89900
  WHEN 'maths-class-with-bhramaramba' THEN 44900
  WHEN 'dance-class-with-sai' THEN 89900
  ELSE "price_usd_cents" * 85 END;--> statement-breakpoint
UPDATE "booking" SET "price_inr_paise" = "price_usd_cents" * 85, "discount_inr_paise" = "discount_usd_cents" * 85;--> statement-breakpoint
UPDATE "payment" SET "amount_inr_paise" = "amount_usd_cents" * 85;--> statement-breakpoint
ALTER TABLE "offering" ALTER COLUMN "price_inr_paise" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "price_inr_paise" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "amount_inr_paise" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "offering" ADD CONSTRAINT "offering_price_nonnegative" CHECK ("offering"."price_inr_paise" >= 0);
--> statement-breakpoint
-- Old USD columns stay readable until step B drops them, but are no longer required.
ALTER TABLE "offering" ALTER COLUMN "price_usd_cents" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "booking" ALTER COLUMN "price_usd_cents" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "amount_usd_cents" DROP NOT NULL;
