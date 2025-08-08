import React, { useState } from 'react';
import { useModuleProgress } from '../../hooks/useModuleProgress';
import ModuleNode from './ModuleNode';
import { supabase } from '../../lib/supabase';

interface ModuleContainerProps {
  userId?: string;
  onModuleSelect?: (moduleId: number) => void;
  currentModuleId?: number;
}

const ModuleContainer: React.FC<ModuleContainerProps> = ({ 
  userId, 
  onModuleSelect,
  currentModuleId 
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(currentModuleId || null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Get current user if not provided
  const [currentUser, setCurrentUser] = React.useState<string | null>(userId || null);

  React.useEffect(() => {
    if (!userId) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setCurrentUser(user?.id || null);
      });
    }
  }, [userId]);

  const {
    modules,
    loading,
    error,
    refreshModules,
    selectModule,
    initializeModules,
    resetProgress
  } = useModuleProgress(currentUser);

  const handleModuleSelect = async (moduleId: number) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      setActionMessage(null);

      const result = await selectModule(moduleId);

      if (result.success) {
        setSelectedModuleId(moduleId);
        setActionMessage(`Module ${moduleId} selected successfully!`);
        onModuleSelect?.(moduleId);
      } else {
        setActionMessage(result.error?.message || 'Failed to select module');
      }
    } catch (err) {
      console.error('Error selecting module:', err);
      setActionMessage('An error occurred while selecting the module');
    } finally {
      setActionLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleInitializeModules = async () => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      setActionMessage(null);

      const result = await initializeModules();

      if (result.success) {
        setActionMessage('Modules initialized successfully!');
      } else {
        setActionMessage(result.error?.message || 'Failed to initialize modules');
      }
    } catch (err) {
      console.error('Error initializing modules:', err);
      setActionMessage('An error occurred while initializing modules');
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const handleResetProgress = async () => {
    if (actionLoading) return;
    
    const confirmed = window.confirm('Are you sure you want to reset all module progress? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setActionLoading(true);
      setActionMessage(null);

      const result = await resetProgress();

      if (result.success) {
        setSelectedModuleId(null);
        setActionMessage('Progress reset successfully!');
      } else {
        setActionMessage(result.error?.message || 'Failed to reset progress');
      }
    } catch (err) {
      console.error('Error resetting progress:', err);
      setActionMessage('An error occurred while resetting progress');
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-center">
          <p className="text-lg mb-4">Please log in to view modules</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading modules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-400 text-center mb-4">
          <p className="text-lg mb-2">Error loading modules</p>
          <p className="text-sm">{error}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={refreshModules}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Retry
          </button>
          <button
            onClick={handleInitializeModules}
            disabled={actionLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Initialize Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Action Message */}
      {actionMessage && (
        <div className="mb-6 p-4 bg-blue-900/50 border border-blue-500 rounded-lg text-blue-200 text-center">
          {actionMessage}
        </div>
      )}

      {/* Debug Controls (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-gray-900/50 border border-gray-600 rounded-lg">
          <h3 className="text-white text-sm font-semibold mb-3">Debug Controls</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={refreshModules}
              disabled={actionLoading}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              onClick={handleInitializeModules}
              disabled={actionLoading}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Initialize
            </button>
            <button
              onClick={handleResetProgress}
              disabled={actionLoading}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Reset Progress
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            User ID: {currentUser} | Modules: {modules.length} | Selected: {selectedModuleId}
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
        {modules.map((module) => (
          <div key={module.id} className="relative">
            <ModuleNode
              module={{
                ...module,
                id: parseInt(module.id) // Convert string id back to number for ModuleNode
              }}
              onSelect={handleModuleSelect}
              isCurrentModule={selectedModuleId === parseInt(module.id)}
            />
            
            {/* Loading overlay for individual modules */}
            {actionLoading && selectedModuleId === parseInt(module.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {modules.length === 0 && (
        <div className="text-center text-white p-8">
          <p className="text-lg mb-4">No modules available</p>
          <button
            onClick={handleInitializeModules}
            disabled={actionLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Initialize Modules
          </button>
        </div>
      )}
    </div>
  );
};

export default ModuleContainer;