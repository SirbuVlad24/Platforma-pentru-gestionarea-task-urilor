import { useState } from "react";
import { Task } from "@/types";

export default function NewTaskForm({ onAdd }: { onAdd: (task: Task) => void }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAdd({ id: Date.now(), title }); 
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
      />
      <button type="submit">Add Task</button>
    </form>
  );
}
