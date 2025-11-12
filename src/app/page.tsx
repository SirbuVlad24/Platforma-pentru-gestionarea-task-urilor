import TaskCard from '../components/TaskCard';

export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Salut, Task Manager! 🚀</h1>
      <p className="mb-4">Lista de task-uri:</p>

      <TaskCard title="Primul task" completed={false} />
      <TaskCard title="Al doilea task" completed={true} />
      <TaskCard title="Al treilea task" />
    </main>
  );
}
