

import dotenv from 'dotenv';
//load environment variables from .env files 
dotenv.config();

const username = process.env.username || null;
const password = process.env.password || null;
export function connectingStringBuilder()
{
    const dbuser = process.env.DATABASE_USER;
    const dbpassword = process.env.DATABASE_PASSWORD;

    const host = "host";
    const port = 5432;

    const dbname = "tdd-todo-app"

    return `postgres://${dbuser}:${dbpassword}@${host}:${port}/${dbname}`


}