import React, { useState } from 'react';
import { useAvailableModules } from '../hooks/useAvailableModules';
import ModuleMap from '../components/modules/ModuleMap';
import { useDeviceLayout } from '../hooks/useOrientation';
import { useAuth } from '../contexts/AuthContext';
// ...existing code...

const ModuleMapScreen: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { modules, loading, error } = useAvailableModules(userId ?? '');
  const [currentModuleId, setCurrentModuleId] = useState(1); // Current available module
  const { isHorizontal: isLandscape } = useDeviceLayout();

  const handleModuleSelect = (id: number) => {
    const selectedModule = modules.find(m => m.id === id);
    
    if (selectedModule && (selectedModule.status === 'available' || selectedModule.status === 'completed')) {
      setCurrentModuleId(id);
      
      // In a real app, this would navigate to the module content
      console.log(`Selected module ${id}: ${selectedModule.title}`);
      
      // Demo: Show alert for now
      alert(`Starting Module ${id}: ${selectedModule.title}`);
    }
  };

  if (loading) return <div>Loading modules...</div>;
  if (error) return <div>Error loading modules: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {isLandscape && (
        <ModuleMap
          modules={modules}
          currentModuleId={currentModuleId}
          onModuleSelect={handleModuleSelect}
        />
      )}
    </div>
  );
};

export {ModuleMapScreen};