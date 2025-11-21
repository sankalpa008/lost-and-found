-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('LOST', 'FOUND');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('ELECTRONICS', 'BOOKS', 'CLOTHING', 'ACCESSORIES', 'DOCUMENTS', 'KEYS', 'BAGS', 'SPORTS', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "supabaseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "imageUrl" TEXT,
    "location" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseId_key" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "User_supabaseId_idx" ON "User"("supabaseId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Item_userId_idx" ON "Item"("userId");

-- CreateIndex
CREATE INDEX "Item_status_idx" ON "Item"("status");

-- CreateIndex
CREATE INDEX "Item_category_idx" ON "Item"("category");

-- CreateIndex
CREATE INDEX "Item_isResolved_idx" ON "Item"("isResolved");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
