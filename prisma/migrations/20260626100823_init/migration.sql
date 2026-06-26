-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('PREFIX', 'SUFFIX', 'REPLACE', 'REGEX', 'WORD_ORDER');

-- CreateEnum
CREATE TYPE "ThesaurusRelation" AS ENUM ('SYNONYM', 'ANTONYM', 'RELATED');

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "sourceLanguage" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DictionaryEntry" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "sourceWord" TEXT NOT NULL,
    "targetWord" TEXT NOT NULL,
    "partOfSpeech" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DictionaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vocabulary" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "partOfSpeech" TEXT,
    "example" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vocabulary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrammaticalRule" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ruleType" "RuleType" NOT NULL,
    "pattern" TEXT NOT NULL,
    "replacement" TEXT NOT NULL DEFAULT '',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrammaticalRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThesaurusEntry" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "related" TEXT NOT NULL,
    "relation" "ThesaurusRelation" NOT NULL DEFAULT 'SYNONYM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThesaurusEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- CreateIndex
CREATE INDEX "Language_isActive_idx" ON "Language"("isActive");

-- CreateIndex
CREATE INDEX "Language_sourceLanguage_idx" ON "Language"("sourceLanguage");

-- CreateIndex
CREATE INDEX "DictionaryEntry_languageId_idx" ON "DictionaryEntry"("languageId");

-- CreateIndex
CREATE INDEX "DictionaryEntry_sourceWord_idx" ON "DictionaryEntry"("sourceWord");

-- CreateIndex
CREATE UNIQUE INDEX "DictionaryEntry_languageId_sourceWord_key" ON "DictionaryEntry"("languageId", "sourceWord");

-- CreateIndex
CREATE INDEX "Vocabulary_languageId_idx" ON "Vocabulary"("languageId");

-- CreateIndex
CREATE UNIQUE INDEX "Vocabulary_languageId_word_key" ON "Vocabulary"("languageId", "word");

-- CreateIndex
CREATE INDEX "GrammaticalRule_languageId_isActive_priority_idx" ON "GrammaticalRule"("languageId", "isActive", "priority");

-- CreateIndex
CREATE INDEX "ThesaurusEntry_languageId_word_idx" ON "ThesaurusEntry"("languageId", "word");

-- AddForeignKey
ALTER TABLE "DictionaryEntry" ADD CONSTRAINT "DictionaryEntry_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vocabulary" ADD CONSTRAINT "Vocabulary_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammaticalRule" ADD CONSTRAINT "GrammaticalRule_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThesaurusEntry" ADD CONSTRAINT "ThesaurusEntry_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
