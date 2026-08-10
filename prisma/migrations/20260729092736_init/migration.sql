-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectTag" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "model" TEXT NOT NULL,
    "tokensIn" INTEGER,
    "tokensOut" INTEGER,
    "costUsd" DOUBLE PRECISION,
    "latencyMs" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "parentTraceId" TEXT,

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trace_projectTag_idx" ON "Trace"("projectTag");

-- CreateIndex
CREATE INDEX "Trace_status_idx" ON "Trace"("status");

-- AddForeignKey
ALTER TABLE "Trace" ADD CONSTRAINT "Trace_parentTraceId_fkey" FOREIGN KEY ("parentTraceId") REFERENCES "Trace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
