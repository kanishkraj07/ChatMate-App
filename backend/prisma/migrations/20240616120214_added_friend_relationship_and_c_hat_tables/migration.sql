-- CreateTable
CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "becameFriendAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Relationship" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FriendsOnUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendshipId" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,

    CONSTRAINT "FriendsOnUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentTime" TIMESTAMP(3) NOT NULL,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FriendsOnUser" ADD CONSTRAINT "FriendsOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendsOnUser" ADD CONSTRAINT "FriendsOnUser_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendsOnUser" ADD CONSTRAINT "FriendsOnUser_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "Relationship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
