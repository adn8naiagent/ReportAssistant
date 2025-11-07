-- AlterTable
-- Make userId nullable in UsageLog table to support anonymous user tracking
ALTER TABLE "UsageLog" ALTER COLUMN "userId" DROP NOT NULL;
