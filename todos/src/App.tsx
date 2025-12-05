import { use, useState } from "react";
import { useTodos } from "./hooks/todoHook";



export default function App() {

  const {} = useTodos();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!title || !description) return;
    
    try {
      createTodo({ title, description },
        {
          onSuccess: () => {
            console.log("Todo created successfully");
          },
          onError: (error) => {
            console.error("Error creating todo:", error); 
        }
      );
    } catch (error) {
      console.error("Error creating todo:", error);
    } finally {
      setTitle("");
      setDescription("");
    }
  }
  return (
  
  <div> hi</div> 
 );
}
