-- Foto kondisi drainase (many-to-one ke drainage_points, reuse tabel files)
CREATE TABLE "drainage_photos" (
    "id" TEXT NOT NULL,
    "drainagePointId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "drainage_photos_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "drainage_photos_drainagePointId_idx" ON "drainage_photos"("drainagePointId");

ALTER TABLE "drainage_photos" ADD CONSTRAINT "drainage_photos_drainagePointId_fkey" FOREIGN KEY ("drainagePointId") REFERENCES "drainage_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drainage_photos" ADD CONSTRAINT "drainage_photos_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
