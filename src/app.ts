// src/server.ts
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import todoRoutes from './routes/todoroutes';

//load environment variables from .env files 
dotenv.config();

const app: Express = express();
//middleware 
app.use(cors()); //ENABLE CORS
app.use(express.json()); //parse every received body as JSON

app.use("/api/todos", todoRoutes); //import todo routes

export default app;