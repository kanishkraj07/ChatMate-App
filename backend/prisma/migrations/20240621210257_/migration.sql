/*
  Warnings:

  - You are about to drop the column `notificationCount` on the `Relationship` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FriendsOnUser" ADD COLUMN     "notificationCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Relationship" DROP COLUMN "notificationCount";
