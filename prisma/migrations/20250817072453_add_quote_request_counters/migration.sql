-- AlterTable
ALTER TABLE "quote_requests" ADD COLUMN "counterBudgetMax" REAL;
ALTER TABLE "quote_requests" ADD COLUMN "counterBudgetMin" REAL;
ALTER TABLE "quote_requests" ADD COLUMN "counterDeadline" DATETIME;
ALTER TABLE "quote_requests" ADD COLUMN "counterMessage" TEXT;
