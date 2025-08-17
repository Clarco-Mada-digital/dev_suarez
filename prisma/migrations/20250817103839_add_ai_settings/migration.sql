-- CreateTable
CREATE TABLE "ai_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "model" TEXT,
    "temperature" REAL NOT NULL DEFAULT 0.4,
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);
