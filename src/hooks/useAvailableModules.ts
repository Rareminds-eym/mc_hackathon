import { useEffect, useState } from 'react';
import { modules as staticModules } from '../data/modules';

export function useAvailableModules(userId: string) {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Use static modules data as primary source
        console.log('📁 Using static modules data from modules.ts');
        const finalModulesData = staticModules.map(module => ({
          ...module,
          // Ensure all required fields are present
          id: module.id,
          title: module.title,
          status: module.status,
          progress: module.progress || 0
        }));

        // Since we're using static modules, we don't need database data

        // Always sort modules by id before processing
        const sortedModulesData = Array.isArray(finalModulesData)
          ? [...finalModulesData].sort((a, b) => {
              // Handle both string and numeric IDs
              const aId = typeof a.id === 'string' && !isNaN(Number(a.id)) ? Number(a.id) : 999;
              const bId = typeof b.id === 'string' && !isNaN(Number(b.id)) ? Number(b.id) : 999;
              return aId - bId;
            })
          : [];

        // Use the modules exactly as defined in your static data
        // This preserves the status you set for each module (available/locked)
        const updatedModules = sortedModulesData.map((module: any) => {
          // Keep the original status from your modules.ts file
          return { ...module };
        });

        // Enhanced debug logging
        console.log('📚 DEBUG: Using static modules data');
        console.log('🔄 DEBUG: Sorted modules', sortedModulesData);
        console.log('✅ DEBUG: Final updatedModules', updatedModules);

        // Debug module information
        if (finalModulesData && finalModulesData.length > 0) {
          console.log('🔑 DEBUG: Module count:', finalModulesData.length);
          console.log('📋 DEBUG: Module IDs:', finalModulesData.map(m => m.id));
          console.log('⚠️ DEBUG: Using static modules data (no unlock_at field)');
        }
        setModules(updatedModules);
      } catch (err) {
        setError(err);
      }
      setLoading(false);
    }
    fetchData();
  }, [userId]);

  return { modules, loading, error };
}
