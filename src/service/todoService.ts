import { db } from "../database";
import { NewTodo, todos } from "../db/schema/schema";
import { eq } from "drizzle-orm";

export const getTodos = async () => {
    return await db.select().from(todos);
};

export const getTodoById = async (id: number) => {
    const result = await db.select().from(todos).where(eq(todos.id, id));
    return result[0];
};

export const createTodo = async (todo:NewTodo) =>
{
    const result = await db.insert(todos).values(todo).returning();
    return result[0];
}

export const updateTodo = async (id:number, todo:Partial<NewTodo>) => 
{
    const result = await db.update(todos)
    .set(todo)
    .where(eq(todos.id, id)).returning();
    return result[0];
}

export const deleteTodo = async (id:number) => 
{
    const result = await db.delete(todos).where(eq(todos.id, id)).returning();
    return result[0];
};