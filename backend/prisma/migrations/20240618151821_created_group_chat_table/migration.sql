-- CreateTable
CREATE TABLE "GroupChat" (
    "id" TEXT NOT NULL,
    "userGroupId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupChat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupChat" ADD CONSTRAINT "GroupChat_userGroupId_fkey" FOREIGN KEY ("userGroupId") REFERENCES "UserGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
