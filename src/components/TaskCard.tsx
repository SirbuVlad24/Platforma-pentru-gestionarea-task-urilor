interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
}

export default function TaskCard({ title, description, priority, status }: TaskCardProps) {
  return (
    <div style={{ border: "1px solid gray", padding: "10px", marginBottom: "10px" }}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <p>Priority: {priority || "Medium"} | Status: {status || "To Do"}</p>
    </div>
  );
}
