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
    <li className="flex justify-between items-center p-2 bg-white rounded border-2 border-black shadow">
      <div className="flex-1">
        <div>
          <span className="font-bold text-red-900">{task.title}</span>
          <span className="text-xs text-red-800 ml-2 font-semibold">(⚓ Priority: {task.priority})</span>
          {task.status && (
            <span className="ml-2 text-xs bg-purple-300 text-purple-900 px-2 py-0.5 rounded font-semibold">
              {task.status === "TODO" ? "To Do" : task.status === "IN_PROGRESS" ? "In Progress" : "Done"}
            </span>
          )}
          {task.completed && (
            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold">
              Completed
            </span>
          )}
        </div>
        {(task as any).description && (
          <p className="text-sm text-purple-800 mt-1">{(task as any).description}</p>
        )}
      </div>
      <button onClick={onAction} className={`${buttonClass} font-semibold shadow`}>
        {actionLabel}
      </button>
    </li>
  );
}

