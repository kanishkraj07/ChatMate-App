-- CreateTable
CREATE TABLE "GlobalNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "isSeen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GlobalNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDetails" (
    "id" TEXT NOT NULL,
    "userNotificationId" TEXT NOT NULL,
    "sentTime" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "subType" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "NotificationDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalNotification_userId_key" ON "GlobalNotification"("userId");

-- AddForeignKey
ALTER TABLE "GlobalNotification" ADD CONSTRAINT "GlobalNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDetails" ADD CONSTRAINT "NotificationDetails_userNotificationId_fkey" FOREIGN KEY ("userNotificationId") REFERENCES "GlobalNotification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
