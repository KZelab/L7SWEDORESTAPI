import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';

import type { Todo } from '@/types/todo';

import {api} from '@/lib/api';

export function useTodos()
{
const queryClient = useQueryClient();
const {data: todos, isLoading, error} = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: api.fetchTodos
});


const createTodoMutation = useMutation({
    mutationFn: api.createTodo,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
});

const deleteTodoMutation = useMutation({
    mutationFn: api.deleteTodo,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
});

const updateTodoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Todo, 'id'>> }) => api.updateTodo(id, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
});

const deleteAllTodosMutation = useMutation({
    mutationFn: api.deleteAllTodos,
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
    updateTodo: updateTodoMutation.mutateAsync,
    deleteAllTodos: deleteAllTodosMutation.mutateAsync,
};
}
