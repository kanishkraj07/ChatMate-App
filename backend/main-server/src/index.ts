import express from "express";
import appRouter from './routes/routes';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from "redis";
import RedisClient from "./RedisClient";

const app = express();

dotenv.config({path:  path.resolve('../.env')});

(async () => {
    await RedisClient.getInstance().initRedis();
})();

app.use(cors());
app.use(express.json());
app.use('/api/v1', appRouter);

app.use((error, req, res, next) => {
    res.status(500).json({
        message: 'Internal Server Error'
    });
});

app.listen(process.env.MAIN_SERVER_PORT || 3000);