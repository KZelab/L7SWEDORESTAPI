import request from 'supertest';
import app from '../src/app';

import {pool} from '../src/db';
import {db} from '../src/db';
import {todos} from '../src/db/schema/schema';

import { sql} from 'drizzle-orm';
import { before } from 'node:test';

//ensure db connection is closed after tests to prevent hanging

afterAll(async () => {
    await pool.end();
});

//clean the table before tests can run 
beforeEach(async () => {
    await db.delete(todos);
});

describe("TODO CRUD operations", () => {

    //test 1, create a new todo
    it("should create a new todo", async () => {

        const res = await request(app)
        .post("/api/todos")
        .send({
            title: "Test Todo",
            description: "This is a test todo"
        });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe("Test Todo");
        expect(res.body.description).toBe("This is a test todo");
        expect(res.body.completed).toBe(false);

        //expect(response.status).toBe(201);
    });

    //test 2 - get all todos
    it("should get all todos", async () => {
        await db.insert(todos).values([
            {title: "Todo 1", description: "Description 1"},
            {title: "Todo 2", description: "Description 2"}
        ]);
        const res = await request(app).get("/api/todos");

        expect(res.status).toBe(200);
        expect(res.body.length).toBe(2);

    });

    //test 3 - get a todo by id 
    it("should get a todo by id", async () => {
        const [newTodo] = await db.insert(todos).values(
            {title: "Todo 1", description: "Description 1"}
        ).returning();

        const res = await request(app).get(`/api/todos/${newTodo.id}`);

        expect(res.status).toBe(200);
        expect(res.body.title).toBe("Todo 1");
        expect(res.body.description).toBe("Description 1");

    });

    //test 4 - update a todo by id
    it("should update a todo by id", async () => {
        const [newTodo] = await db.insert(todos).values(
            {title: "Todo 1", description: "Description 1"}
        ).returning();

        const res = await request(app)
        .put(`/api/todos/${newTodo.id}`)
        .send({
            completed: true
        });

        expect(res.status).toBe(200);
        expect(res.body.completed).toBe(true);
    });

    //test 5 - delete a todo by id
    it("should delete a todo by id", async () => {
        const [newTodo] = await db.insert(todos).values(
            {title: "Todo 1", description: "Description 1"}
        ).returning();

        const res = await request(app).delete(`/api/todos/${newTodo.id}`);
        expect(res.status).toBe(200);

        const getRes = await request(app).get(`/api/todos/${newTodo.id}`);
        expect(getRes.status).toBe(404);
    });
});

