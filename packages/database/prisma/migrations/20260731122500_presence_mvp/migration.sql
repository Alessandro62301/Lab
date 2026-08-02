CREATE TYPE "PublicPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED');

CREATE TYPE "PageBlockType" AS ENUM ('LINK', 'FEATURE', 'TEXT', 'IMAGE', 'GALLERY', 'FORM');

CREATE TABLE "PublicPage" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "status" "PublicPageStatus" NOT NULL DEFAULT 'DRAFT',
    "themeJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    CONSTRAINT "PublicPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL,
    "publicPageId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "PageBlockType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "mediaUrl" TEXT,
    "position" INTEGER NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "settingsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "pageId" TEXT,
    "moduleKey" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "eventName" TEXT NOT NULL,
    "anonymousId" TEXT,
    "sessionId" TEXT,
    "path" TEXT,
    "referrer" TEXT,
    "metadataJson" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PublicPage_slug_key" ON "PublicPage"("slug");
CREATE INDEX "PublicPage_workspaceId_status_idx" ON "PublicPage"("workspaceId", "status");
CREATE INDEX "PublicPage_projectId_idx" ON "PublicPage"("projectId");
CREATE UNIQUE INDEX "PublicPage_workspaceId_name_key" ON "PublicPage"("workspaceId", "name");
CREATE INDEX "PageBlock_publicPageId_type_idx" ON "PageBlock"("publicPageId", "type");
CREATE UNIQUE INDEX "PageBlock_publicPageId_key_key" ON "PageBlock"("publicPageId", "key");
CREATE UNIQUE INDEX "PageBlock_publicPageId_position_key" ON "PageBlock"("publicPageId", "position");
CREATE INDEX "AnalyticsEvent_workspaceId_moduleKey_eventName_occurredAt_idx" ON "AnalyticsEvent"("workspaceId", "moduleKey", "eventName", "occurredAt");
CREATE INDEX "AnalyticsEvent_pageId_eventName_occurredAt_idx" ON "AnalyticsEvent"("pageId", "eventName", "occurredAt");
CREATE INDEX "AnalyticsEvent_entityType_entityId_eventName_idx" ON "AnalyticsEvent"("entityType", "entityId", "eventName");
CREATE INDEX "AnalyticsEvent_anonymousId_occurredAt_idx" ON "AnalyticsEvent"("anonymousId", "occurredAt");

ALTER TABLE "PublicPage" ADD CONSTRAINT "PublicPage_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PublicPage" ADD CONSTRAINT "PublicPage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PublicPage" ADD CONSTRAINT "PublicPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_publicPageId_fkey" FOREIGN KEY ("publicPageId") REFERENCES "PublicPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "PublicPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
