-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormFieldType" AS ENUM ('WELCOME', 'NAME', 'EMAIL', 'PHONE', 'CPF', 'CNPJ', 'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'CURRENCY', 'DATE', 'ADDRESS', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SELECT', 'TERMS', 'MESSAGE', 'THANK_YOU');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'SPAM');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- CreateEnum
CREATE TYPE "FormLogicOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'IS_EMPTY', 'IS_NOT_EMPTY', 'GREATER_THAN', 'LESS_THAN');

-- CreateEnum
CREATE TYPE "FormLogicAction" AS ENUM ('SHOW', 'HIDE', 'GOTO', 'SUBMIT');

-- CreateTable
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "welcomeTitle" TEXT NOT NULL DEFAULT 'Olá! Vamos começar?',
    "welcomeDescription" TEXT,
    "thankYouTitle" TEXT NOT NULL DEFAULT 'Tudo certo!',
    "thankYouDescription" TEXT,
    "buttonLabel" TEXT NOT NULL DEFAULT 'Continuar',
    "primaryColor" TEXT NOT NULL DEFAULT '#6d4aff',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "fontFamily" TEXT NOT NULL DEFAULT 'Geist',
    "borderRadius" INTEGER NOT NULL DEFAULT 12,
    "logoUrl" TEXT,
    "collectPartial" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmail" BOOLEAN NOT NULL DEFAULT true,
    "limitDuplicate" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "FormFieldType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "placeholder" TEXT,
    "position" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "optionsJson" JSONB,
    "settingsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "FormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormLogicRule" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "sourceFieldId" TEXT NOT NULL,
    "targetFieldId" TEXT,
    "operator" "FormLogicOperator" NOT NULL,
    "action" "FormLogicAction" NOT NULL,
    "valueJson" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormLogicRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormSubmission" (
    "id" TEXT NOT NULL,
    "externalKey" TEXT,
    "workspaceId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "leadId" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "respondentName" TEXT,
    "respondentEmail" TEXT,
    "respondentPhone" TEXT,
    "utmJson" JSONB,
    "metadataJson" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "textValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailNormalized" TEXT,
    "phone" TEXT,
    "phoneNormalized" TEXT,
    "cpf" TEXT,
    "cnpj" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Form_slug_key" ON "Form"("slug");

-- CreateIndex
CREATE INDEX "Form_workspaceId_status_idx" ON "Form"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Form_projectId_idx" ON "Form"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Form_workspaceId_name_key" ON "Form"("workspaceId", "name");

-- CreateIndex
CREATE INDEX "FormField_formId_type_idx" ON "FormField"("formId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "FormField_formId_key_key" ON "FormField"("formId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "FormField_formId_position_key" ON "FormField"("formId", "position");

-- CreateIndex
CREATE INDEX "FormLogicRule_formId_priority_idx" ON "FormLogicRule"("formId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "FormSubmission_externalKey_key" ON "FormSubmission"("externalKey");

-- CreateIndex
CREATE INDEX "FormSubmission_workspaceId_status_createdAt_idx" ON "FormSubmission"("workspaceId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "FormSubmission_formId_createdAt_idx" ON "FormSubmission"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "FormSubmission_leadId_idx" ON "FormSubmission"("leadId");

-- CreateIndex
CREATE INDEX "FormAnswer_fieldId_idx" ON "FormAnswer"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "FormAnswer_submissionId_fieldId_key" ON "FormAnswer"("submissionId", "fieldId");

-- CreateIndex
CREATE INDEX "Lead_workspaceId_status_lastSeenAt_idx" ON "Lead"("workspaceId", "status", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_workspaceId_emailNormalized_key" ON "Lead"("workspaceId", "emailNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_workspaceId_phoneNormalized_key" ON "Lead"("workspaceId", "phoneNormalized");

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormField" ADD CONSTRAINT "FormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormLogicRule" ADD CONSTRAINT "FormLogicRule_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormLogicRule" ADD CONSTRAINT "FormLogicRule_sourceFieldId_fkey" FOREIGN KEY ("sourceFieldId") REFERENCES "FormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormLogicRule" ADD CONSTRAINT "FormLogicRule_targetFieldId_fkey" FOREIGN KEY ("targetFieldId") REFERENCES "FormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormSubmission" ADD CONSTRAINT "FormSubmission_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "FormSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormAnswer" ADD CONSTRAINT "FormAnswer_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "FormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
