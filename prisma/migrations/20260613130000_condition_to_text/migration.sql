-- Ubah condition drainage_points dari enum DrainageCondition -> TEXT (fleksibel).
-- Enum DrainageCondition tetap dipakai drainage_segments.
ALTER TABLE "drainage_points" ALTER COLUMN "condition" TYPE TEXT USING "condition"::text;
