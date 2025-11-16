"use client";

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
}

export default function TaskCard({
  title,
  description,
  priority,
  status,
}: TaskCardProps) {
  const priorityColor =
    priority === "High"
      ? "bg-red-200 text-red-800"
      : priority === "Low"
      ? "bg-green-200 text-green-800"
      : "bg-yellow-200 text-yellow-800";

  const statusColor =
    status === "Done"
      ? "bg-green-100 text-green-800"
      : status === "In Progress"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="border border-gray-300 rounded-lg shadow-sm p-4 mb-4 bg-white">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-gray-700 mb-2">{description}</p>}

      <div className="flex gap-2">
        <span className={`px-2 py-1 rounded text-sm font-medium ${priorityColor}`}>
          {priority || "Medium"}
        </span>
        <span className={`px-2 py-1 rounded text-sm font-medium ${statusColor}`}>
          {status || "To Do"}
        </span>
      </div>
    </div>
  );
}
