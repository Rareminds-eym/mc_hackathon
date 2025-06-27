import React, { useState } from 'react';
import { modules as initialModules } from '../data/modules';
import ModuleMap from '../components/roadmap/ModuleMap';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { Module } from '../../types/module';

const GameRoadmap: React.FC = () => {
  const [modules] = useState<Module[]>(initialModules); // Remove setModules since it's unused
  const [currentModuleId, setCurrentModuleId] = useState(3); // Current available module
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

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* You can now use isMobile as needed */}
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

export default GameRoadmap;
