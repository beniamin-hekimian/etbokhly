ALTER TABLE "meals"
  ADD COLUMN "editRequestStatus" "MealRequestStatus",
  ADD COLUMN "editRequestRejectReason" TEXT,
  ADD COLUMN "pendingTitle" TEXT,
  ADD COLUMN "pendingPhoto" TEXT,
  ADD COLUMN "pendingPrice" DECIMAL(10, 2),
  ADD COLUMN "pendingContent" TEXT,
  ADD COLUMN "pendingTagIds" JSONB;

ALTER TABLE "orders"
  ADD COLUMN "note" TEXT,
  ADD COLUMN "rejectionReason" TEXT;
