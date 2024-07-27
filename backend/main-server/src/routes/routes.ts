import express from 'express';
import authRouter from './auth';
import chatRouter from './chats';
import groupRouter from './groups';
import friendRequestRouter from './friendRequest';
import userRouter from './user';
import notificationRouter from './notification';

const appRouter = express.Router();

appRouter.use('/auth', authRouter);
appRouter.use('/user', userRouter);
appRouter.use('/friendRequest', friendRequestRouter)
appRouter.use('/chat', chatRouter);
appRouter.use('/group', groupRouter);
appRouter.use('/notification', notificationRouter);

export default appRouter;
