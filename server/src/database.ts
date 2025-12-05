import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema/schema";


import dotenv from 'dotenv';
//load environment variables from .env files 
dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});


export const db = drizzle(pool, { schema });

