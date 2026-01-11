-- Adjust completedHours to decimal(5,2) to support fractional hours
ALTER TABLE "placements"
  ALTER COLUMN "completedHours" TYPE numeric(5,2) USING "completedHours"::numeric(5,2),
  ALTER COLUMN "completedHours" SET DEFAULT 0;
