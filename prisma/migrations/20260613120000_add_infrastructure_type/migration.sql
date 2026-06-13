-- Tambah kolom jenis infrastruktur (nullable, data lama -> NULL)
ALTER TABLE "drainage_points" ADD COLUMN "infrastructure_type" TEXT;

-- Index untuk filter berdasarkan jenis infrastruktur
CREATE INDEX "drainage_points_infrastructure_type_idx" ON "drainage_points"("infrastructure_type");
