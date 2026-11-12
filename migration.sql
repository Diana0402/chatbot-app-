CREATE TABLE "ChatSession" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT 'New conversation',
  "model" TEXT NOT NULL DEFAULT 'TrendWear Assistant',
  "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
  "topP" DOUBLE PRECISION NOT NULL DEFAULT 0.9,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SystemPrompt" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SystemPrompt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "sizes" TEXT NOT NULL,
  "material" TEXT NOT NULL,
  "price" DOUBLE PRECISION NOT NULL,
  "care" TEXT NOT NULL,
  "color" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SystemPrompt_name_key" ON "SystemPrompt"("name");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
CREATE INDEX "Message_sessionId_createdAt_idx" ON "Message"("sessionId", "createdAt");
ALTER TABLE "Message" ADD CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
