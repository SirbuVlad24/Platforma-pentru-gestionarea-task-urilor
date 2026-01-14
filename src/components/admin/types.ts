export type User = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  projectIds?: number[];
};

export type Task = {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  createdAt: string;
  deadline?: string | null;
  project?: {
    id: number;
    name: string;
  } | null;
  assignedUsers: {
    id: number;
    userId: string;
    taskId: number;
    user: {
      id: string;
      email: string;
    };
  }[];
};

