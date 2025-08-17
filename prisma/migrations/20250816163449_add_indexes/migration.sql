-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_categoryId_idx" ON "Project"("categoryId");

-- CreateIndex
CREATE INDEX "ProjectBid_projectId_idx" ON "ProjectBid"("projectId");

-- CreateIndex
CREATE INDEX "ProjectBid_freelancerId_idx" ON "ProjectBid"("freelancerId");

-- CreateIndex
CREATE INDEX "ProjectSkill_projectId_idx" ON "ProjectSkill"("projectId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
