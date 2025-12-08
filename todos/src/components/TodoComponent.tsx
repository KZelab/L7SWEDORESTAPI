import { useState } from "react";
import { useTodos } from "@/hooks/todoHook";
import type { Todo } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function TodoComponent() {
  const { todos, isLoading, error, createTodo, deleteTodo, updateTodo, deleteAllTodos } = useTodos();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      await createTodo({ title, description });
      toast.success("Todo created successfully");
      setTitle("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to create todo");
      console.error("Error creating todo:", error);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    if (!todo.id) return;

    try {
      await updateTodo({
        id: todo.id,
        data: { completed: !todo.completed }
      });
      toast.success("Todo updated");
    } catch (error) {
      toast.error("Failed to update todo");
      console.error("Error updating todo:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      toast.success("Todo deleted");
    } catch (error) {
      toast.error("Failed to delete todo");
      console.error("Error deleting todo:", error);
    }
  };

  const handleDeleteAll = async () => {
    if (!todos || todos.length === 0) {
      toast.error("No todos to delete");
      return;
    }

    try {
      await deleteAllTodos();
      toast.success("All todos deleted");
    } catch (error) {
      toast.error("Failed to delete all todos");
      console.error("Error deleting all todos:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading todos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error loading todos: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Todo</CardTitle>
          <CardDescription>Create a new todo item</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Todo title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Todo
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Todos</h2>
          {todos && todos.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteAll}
              size="sm"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All
            </Button>
          )}
        </div>
        {!todos || todos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No todos yet. Create one above!
            </CardContent>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card key={todo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={todo.completed || false}
                    onCheckedChange={() => handleToggleComplete(todo)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className={`font-semibold ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.title}
                    </h3>
                    <p className={`text-sm text-muted-foreground mt-1 ${todo.completed ? 'line-through' : ''}`}>
                      {todo.description}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => todo.id && handleDelete(todo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
