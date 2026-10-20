-- Reposition as trainers & coaches (not spiritual): four categories replace the original seven.
INSERT INTO "category" ("slug", "name", "blurb", "icon", "examples", "sort_order") VALUES
  ('academics-chess-coding', 'Academics, Chess & Coding', 'Maths, science, test prep, chess and coding with expert tutors and coaches', 'GraduationCap', '{"Maths","Science","SAT prep","Chess","Coding for kids"}', 0),
  ('music-dance-arts', 'Music, Dance & Arts', 'Vocal, instruments, classical and Bollywood dance, drawing and art', 'Music', '{"Carnatic vocal","Keyboard","Bharatanatyam","Bollywood dance","Drawing"}', 1),
  ('fitness-yoga-sports', 'Fitness, Yoga & Sports', 'Personal training, yoga, meditation, Zumba and sports coaching', 'Activity', '{"Personal training","Yoga","Meditation","Zumba","Cricket coaching"}', 2),
  ('languages-career', 'Languages & Career Coaching', 'Mother-tongue classes, spoken English, public speaking and career coaching', 'Languages', '{"Telugu","Hindi","Spoken English","Public speaking","Interview prep"}', 3)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
-- Map old categories onto the new ones.
CREATE TEMP TABLE "category_map" ("old" text PRIMARY KEY, "new" text NOT NULL);
--> statement-breakpoint
INSERT INTO "category_map" VALUES
  ('career-learning', 'academics-chess-coding'),
  ('kids-culture', 'music-dance-arts'),
  ('yoga-fitness', 'fitness-yoga-sports'),
  ('health-nutrition', 'fitness-yoga-sports'),
  ('mind-relationships', 'fitness-yoga-sports'),
  ('spiritual-astrology', 'fitness-yoga-sports'),
  ('puja-rituals', 'fitness-yoga-sports');
--> statement-breakpoint
UPDATE "offering" o SET "category_slug" = m."new" FROM "category_map" m WHERE o."category_slug" = m."old";
--> statement-breakpoint
INSERT INTO "coach_category" ("coach_id", "category_slug")
  SELECT cc."coach_id", m."new" FROM "coach_category" cc JOIN "category_map" m ON m."old" = cc."category_slug"
ON CONFLICT DO NOTHING;
--> statement-breakpoint
DELETE FROM "coach_category" WHERE "category_slug" IN (SELECT "old" FROM "category_map");
--> statement-breakpoint
DELETE FROM "category" WHERE "slug" IN (SELECT "old" FROM "category_map");
--> statement-breakpoint
DROP TABLE "category_map";
