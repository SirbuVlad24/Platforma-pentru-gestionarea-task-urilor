export interface Task {
    id: number;
    title: string;
    description?: string;
    status?: "To Do" | "In Progress" | "Done";
    priority?: "Low" | "Medium" | "High";
    project?: string;
    deadline?: string | null;
  }
  