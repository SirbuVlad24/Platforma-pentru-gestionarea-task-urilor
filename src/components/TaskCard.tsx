interface TaskCardProps {
  title: string;
  completed?: boolean;
}

export default function TaskCard({ title, completed = false }: TaskCardProps) {
  return (
    <div
      className={`p-4 mb-4 rounded border transition-colors ${
        completed ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
      }`}
    >
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-700 text-sm">
        Status: {completed ? 'Completat ✅' : 'Incomplet ❌'}
      </p>
    </div>
  );
}