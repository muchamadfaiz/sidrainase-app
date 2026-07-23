-- AlterTable
ALTER TABLE "drainage_points" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'verified',
ADD COLUMN     "submitter_name" TEXT,
ADD COLUMN     "submitter_phone" TEXT;

-- CreateTable
CREATE TABLE "drainage_audits" (
    "id" TEXT NOT NULL,
    "drainagePointId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "actor_name" TEXT,
    "actor_phone" TEXT,
    "actor_user" TEXT,
    "changes" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drainage_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "drainage_audits_drainagePointId_idx" ON "drainage_audits"("drainagePointId");

-- CreateIndex
CREATE INDEX "drainage_audits_created_at_idx" ON "drainage_audits"("created_at");

-- AddForeignKey
ALTER TABLE "drainage_audits" ADD CONSTRAINT "drainage_audits_drainagePointId_fkey" FOREIGN KEY ("drainagePointId") REFERENCES "drainage_points"("id") ON DELETE CASCADE ON UPDATE CASCADE;
