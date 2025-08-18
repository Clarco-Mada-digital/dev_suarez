-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "job_title" TEXT,
    "company" TEXT,
    "phone_number" TEXT,
    "skills" TEXT,
    "languages" TEXT,
    "awards" TEXT,
    "availability" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL DEFAULT 0,
    "hourly_rate" REAL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "completedProjectsCount" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_profiles" ("availability", "awards", "bio", "company", "completedProjectsCount", "created_at", "hourly_rate", "id", "job_title", "languages", "location", "phone_number", "rating", "ratingCount", "skills", "updated_at", "userId", "website") SELECT "availability", "awards", "bio", "company", "completedProjectsCount", "created_at", "hourly_rate", "id", "job_title", "languages", "location", "phone_number", "rating", "ratingCount", "skills", "updated_at", "userId", "website" FROM "user_profiles";
DROP TABLE "user_profiles";
ALTER TABLE "new_user_profiles" RENAME TO "user_profiles";
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
