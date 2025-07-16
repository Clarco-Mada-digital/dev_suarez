/*
  Warnings:

  - You are about to drop the column `clerkId` on the `users` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordSalt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
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
    "availability" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL,
    "hourly_rate" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" TEXT NOT NULL
);
INSERT INTO "new_user_profiles" ("bio", "company", "created_at", "id", "job_title", "location", "phone_number", "updated_at", "userId", "website") SELECT "bio", "company", "created_at", "id", "job_title", "location", "phone_number", "updated_at", "userId", "website" FROM "user_profiles";
DROP TABLE "user_profiles";
ALTER TABLE "new_user_profiles" RENAME TO "user_profiles";
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "passwordHash" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "lastSignInAt" DATETIME,
    "profileId" TEXT,
    CONSTRAINT "users_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "user_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("created_at", "email", "email_verified", "id", "image", "lastSignInAt", "name", "role", "updated_at") SELECT "created_at", "email", "email_verified", "id", "image", "lastSignInAt", "name", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_profileId_key" ON "users"("profileId");
CREATE INDEX "users_email_idx" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
