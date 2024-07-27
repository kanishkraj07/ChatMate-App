import { PrismaClient } from "@prisma/client";
import express from "express";
import { authValidator } from "../middlewares/auth";

const notificationRouter = express.Router();

const prismaClient = new PrismaClient();


notificationRouter.delete("/",authValidator, async(req, res) => {
    const notificationId: string = req.query.notificationId as string;
   await prismaClient.notificationDetails.delete({
        where: {
            id: notificationId
        }
    });

    res.status(200).json({
        messsage: "Notification delete successful"
    })
})

export default notificationRouter;
