// ...existing code...
import { useAvailableModules } from '../hooks/useAvailableModules';
import { completeLevel } from '../services/levelService';
// ...existing code...

interface ModuleListProps {
  userId: string;
}

export default function ModuleList({ userId }: ModuleListProps) {
  const { modules, loading, error } = useAvailableModules(userId);

  const handleCompleteLevel = async (moduleId: number, levelId: number) => {
    try {
      await completeLevel(userId, moduleId, levelId);
      // Optionally, you can refetch modules here if needed
      // window.location.reload(); // or use a state update
    } catch (err) {
      if (err instanceof Error) {
        alert('Error completing level: ' + err.message);
      } else {
        alert('Error completing level');
      }
    }
  };

  if (loading) return <div>Loading modules...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Always sort modules by id before rendering
  const sortedModules = Array.isArray(modules)
    ? [...modules].sort((a, b) => Number(a.id) - Number(b.id))
    : [];
  return (
    <ul>
      {sortedModules.map(module => (
        <li key={module.id}>
          {module.title} <strong>({module.status})</strong>
          {/* Example: Button to complete first level of each module */}
          {/* The status shown here is based on per-user progress from level_progress, not the global modules table status column. */}
          <button onClick={() => handleCompleteLevel(module.id, 1)}>
            Complete Level 1
          </button>
        </li>
      ))}
    </ul>
  );
}
