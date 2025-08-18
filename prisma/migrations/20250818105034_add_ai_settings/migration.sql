-- CreateTable
CREATE TABLE "AISettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "provider" TEXT NOT NULL DEFAULT 'mock',
    "model" TEXT,
    "temperature" REAL NOT NULL DEFAULT 0.4,
    "updatedAt" DATETIME NOT NULL
);
