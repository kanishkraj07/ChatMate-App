/*
  Warnings:

  - You are about to drop the column `friendshipId` on the `FriendsOnUser` table. All the data in the column will be lost.
  - Added the required column `friendId` to the `FriendsOnUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FriendsOnUser" DROP CONSTRAINT "FriendsOnUser_friendshipId_fkey";

-- AlterTable
ALTER TABLE "FriendsOnUser" DROP COLUMN "friendshipId",
ADD COLUMN     "friendId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "FriendsOnUser" ADD CONSTRAINT "FriendsOnUser_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Friend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
