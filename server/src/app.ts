// src/server.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import todoRoutes from './routes/todoroutes';
import { pool } from './database';

//load environment variables from .env files
dotenv.config();

const app: Express = express();

//middleware
app.use(morgan('dev')); //HTTP request logger
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow Vite dev server
    credentials: true
})); //ENABLE CORS
app.use(express.json()); //parse every received body as JSON

//health check endpoint
app.get('/health', async (req: Request, res: Response) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'unknown'
    };

    try {
        // Test database connection
        await pool.query('SELECT 1');
        health.database = 'connected';
    } catch (error) {
        health.status = 'degraded';
        health.database = 'disconnected';
        return res.status(503).json(health);
    }

    res.status(200).json(health);
});

app.use("/api/todos", todoRoutes); //import todo routes

export default app;