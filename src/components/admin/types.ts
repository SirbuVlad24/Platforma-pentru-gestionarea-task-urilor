export type User = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
};

export type Task = {
  id: number;
  title: string;
  completed: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
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

