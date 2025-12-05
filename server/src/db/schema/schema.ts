import {pgTable, serial, text, boolean, timestamp} from "drizzle-orm/pg-core"
import { todo } from "node:test";


export const todos = pgTable("todos", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description:text("description"),
    completed:boolean("completed").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow()
});

export type todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;