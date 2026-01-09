import { Task } from "./types";
import AdminTaskItem from "./AdminTaskItem";

interface TasksListProps {
  tasks: Task[];
  onAction: (taskId: number) => void;
  actionLabel: string;
  actionColor?: "green" | "red";
  emptyMessage: string;
  title: string;
}

export default function TasksList({
  tasks,
  onAction,
  actionLabel,
  actionColor = "green",
  emptyMessage,
  title,
}: TasksListProps) {
  return (
    <div className={tasks.length > 0 ? "mb-4" : ""}>
      <h3 className="font-bold text-red-900 mb-2" style={{ fontFamily: "'Pirata One', cursive" }}>
        {title} ({tasks.length})
      </h3>
      {tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <AdminTaskItem
              key={task.id}
              task={task}
              onAction={() => onAction(task.id)}
              actionLabel={actionLabel}
              actionColor={actionColor}
            />
          ))}
        </ul>
      ) : (
        <p className="text-red-800 text-sm italic font-semibold">{emptyMessage}</p>
      )}
    </div>
  );
}

