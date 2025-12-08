import type { Todo } from "@/types/todo";


const API_URL = 'http://localhost:3000/api/todos';


export const api =
{
    fetchTodos: async () => {
        const response = await fetch(API_URL);
        if(!response.ok) {
            console.log(response);
            throw new Error('Failed to fetch todos');
        }
        return response.json();
    },
    createTodo: async (input :Todo) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),

        });

        if(!response.ok) {
            throw new Error('Failed to create todo');
        }
        return response.json();
    },
    deleteTodo: async (id: string) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        if(!response.ok) {
            throw new Error('Failed to delete todo');
        }
        return response.json();
    },
    updateTodo: async (id: string, input: Partial<Omit<Todo, 'id'>>) => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });
        if(!response.ok) {
            throw new Error('Failed to update todo');
        }
        return response.json();
    },
    deleteAllTodos: async () => {
        const response = await fetch(API_URL, {
            method: 'DELETE',
        });
        if(!response.ok) {
            throw new Error('Failed to delete all todos');
        }
        return response.json();
    },
}