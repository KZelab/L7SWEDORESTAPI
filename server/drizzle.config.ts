import type { Config } from 'drizzle-kit';

import dotenv from 'dotenv';
//load environment variables from .env files 
dotenv.config();


export default {
    schema: './src/db/schema/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    }
} satisfies Config;