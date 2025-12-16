import { Task } from "./types";

interface AdminTaskItemProps {
  task: Task;
  onAction: () => void;
  actionLabel: string;
  actionColor?: "green" | "red";
}

export default function AdminTaskItem({
  task,
  onAction,
  actionLabel,
  actionColor = "green",
}: AdminTaskItemProps) {
  const buttonClass =
    actionColor === "red"
      ? "ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
      : "ml-2 px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600";

  return (
    <li className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
      <div className="flex-1">
        <div>
          <span className="font-medium">{task.title}</span>
          <span className="text-xs text-gray-500 ml-2">(Priority: {task.priority})</span>
          {task.status && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {task.status === "TODO" ? "To Do" : task.status === "IN_PROGRESS" ? "In Progress" : "Done"}
            </span>
          )}
          {task.completed && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              Completed
            </span>
          )}
        </div>
        {(task as any).description && (
          <p className="text-sm text-gray-600 mt-1">{(task as any).description}</p>
        )}
      </div>
      <button onClick={onAction} className={buttonClass}>
        {actionLabel}
      </button>
    </li>
  );
}

