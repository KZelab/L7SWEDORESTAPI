import TodoComponent from "./components/TodoComponent";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <TodoComponent />
      <Toaster />
    </div>
  );
}
