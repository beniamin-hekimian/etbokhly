-- CreateTable
CREATE TABLE "ratings" (
    "raterId" UUID NOT NULL,
    "chefId" UUID NOT NULL,
    "score" SMALLINT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("raterId","chefId")
);

-- CreateIndex
CREATE INDEX "ratings_chefId_idx" ON "ratings"("chefId");

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_chefId_fkey" FOREIGN KEY ("chefId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
