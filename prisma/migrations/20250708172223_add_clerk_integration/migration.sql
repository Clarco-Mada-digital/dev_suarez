-- First, add the new columns as nullable
PRAGMA foreign_keys=OFF;

-- Add clerkId as nullable first
ALTER TABLE "users" ADD COLUMN "clerkId" TEXT;
-- Add role with default value
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
-- Add lastSignInAt as nullable
ALTER TABLE "users" ADD COLUMN "lastSignInAt" DATETIME;

-- Create indexes for the new columns
CREATE UNIQUE INDEX IF NOT EXISTS "users_clerkId_key" ON "users"("clerkId");
CREATE INDEX IF NOT EXISTS "users_clerkId_idx" ON "users"("clerkId");

-- Update existing users with a temporary clerkId (you'll need to update these with real Clerk IDs)
-- For existing users, we'll set a temporary value that should be updated by the application
UPDATE "users" SET "clerkId" = 'temp_' || id;

-- Now make clerkId required
-- First, drop and recreate the table to make clerkId required
PRAGMA foreign_keys=OFF;

-- Create a new table with the correct schema
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" DATETIME,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "lastSignInAt" DATETIME
);

-- Copy data from the old table to the new one
INSERT INTO "new_users" ("id", "clerkId", "name", "email", "email_verified", "image", "role", "created_at", "updated_at", "lastSignInAt")
SELECT "id", COALESCE("clerkId", 'temp_' || id), "name", "email", "email_verified", "image", COALESCE("role", 'USER'), "created_at", "updated_at", "lastSignInAt" FROM "users";

-- Drop the old table and rename the new one
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_clerkId_key" ON "users"("clerkId");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_clerkId_idx" ON "users"("clerkId");

-- Re-enable foreign keys
PRAGMA foreign_keys=ON;
