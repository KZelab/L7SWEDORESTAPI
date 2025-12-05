import { useQueryClient, useMutation, useQuery, QueryClient } from '@tanstack/react-query';

import type { Todo } from '@/types/todo';

import {api} from '@/lib/api';


const queryClient = useQueryClient();

export function useTodos()
{
const {data: todos, isLoading, error} = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: async () => {
        const response = await api.fetchTodos();
        return response.data;
    }
});


const createTodoMutation = useMutation({
    mutationFn: async (newTodo: Todo) => {
        const response = await api.createTodo(newTodo);
        return response.data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
});

const deleteTodoMutation = useMutation({
    mutationFn: async (id: string) => {
        const response = await api.deleteTodo(id);
        return response.data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
});

return {
    todos,
    isLoading,
    error,
    createTodo: createTodoMutation.mutateAsync,
    deleteTodo: deleteTodoMutation.mutateAsync,
};
}
