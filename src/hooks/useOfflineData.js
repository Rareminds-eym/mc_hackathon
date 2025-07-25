import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/dexie';

/**
 * Custom hook for accessing live Dexie data for any table
 * Returns reactive data that updates when the underlying Dexie table changes
 * 
 * @param {string} tableName - Name of the table to query
 * @param {object} options - Query options
 * @param {string} options.userId - Filter by user_id (recommended for user-specific data)
 * @param {object} options.where - Additional where conditions
 * @param {string} options.orderBy - Column to order by
 * @param {number} options.limit - Limit number of results
 * @returns {object} { data, loading, error, refetch }
 */
export const useOfflineData = (tableName, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId, where = {}, orderBy, limit } = options;

  // Function to fetch data from Dexie
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the table
      const table = db.table(tableName);
      if (!table) {
        throw new Error(`Table '${tableName}' not found`);
      }

      // Start building the query
      let query = table.toCollection();

      // Apply user filter if provided
      if (userId) {
        query = table.where('user_id').equals(userId);
      }

      // Apply additional where conditions
      Object.entries(where).forEach(([key, value]) => {
        if (key !== 'user_id') { // Skip user_id as it's handled above
          query = query.and(item => item[key] === value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.sortBy(orderBy);
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      // Execute query
      const result = await query.toArray();
      setData(result);
      
    } catch (err) {
      console.error(`Error fetching data from ${tableName}:`, err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tableName, userId, where, orderBy, limit]);

  // Set up live query using Dexie's live queries
  useEffect(() => {
    let subscription;

    const setupLiveQuery = async () => {
      try {
        const table = db.table(tableName);
        if (!table) {
          throw new Error(`Table '${tableName}' not found`);
        }

        // Create a live query that automatically updates when data changes
        subscription = table.hook('creating', () => fetchData());
        table.hook('updating', () => fetchData());
        table.hook('deleting', () => fetchData());

        // Initial fetch
        await fetchData();
        
      } catch (err) {
        console.error(`Error setting up live query for ${tableName}:`, err);
        setError(err);
        setLoading(false);
      }
    };

    setupLiveQuery();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe?.();
      }
    };
  }, [fetchData, tableName]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for getting a single record by ID
 * 
 * @param {string} tableName - Name of the table
 * @param {string|number} id - Record ID
 * @returns {object} { data, loading, error, refetch }
 */
export const useOfflineRecord = (tableName, id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecord = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const table = db.table(tableName);
      if (!table) {
        throw new Error(`Table '${tableName}' not found`);
      }

      const record = await table.get(id);
      setData(record || null);
      
    } catch (err) {
      console.error(`Error fetching record ${id} from ${tableName}:`, err);
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [tableName, id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const refetch = useCallback(() => {
    fetchRecord();
  }, [fetchRecord]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for getting table statistics
 * 
 * @param {string} tableName - Name of the table
 * @returns {object} { count, loading, error }
 */
export const useOfflineTableStats = (tableName) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const table = db.table(tableName);
        if (!table) {
          throw new Error(`Table '${tableName}' not found`);
        }

        const tableCount = await table.count();
        setCount(tableCount);
        
      } catch (err) {
        console.error(`Error fetching stats for ${tableName}:`, err);
        setError(err);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tableName]);

  return {
    count,
    loading,
    error
  };
};
