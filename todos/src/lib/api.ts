import type { Todo } from "@/types/todo";


const API_URL = 'http://localhost:3000/api/todos';


export const api =
{
    fetchTodos: async () => {
        const response = await fetch(API_URL);
        if(!response.ok) {
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
    
}