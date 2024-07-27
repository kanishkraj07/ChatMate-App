/*
  Warnings:

  - You are about to drop the column `isSeen` on the `UserGroup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN     "notificationCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserGroup" DROP COLUMN "isSeen",
ADD COLUMN     "notificationCount" INTEGER NOT NULL DEFAULT 0;
