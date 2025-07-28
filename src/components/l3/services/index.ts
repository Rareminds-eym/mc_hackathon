/**
 * Level 3 Database Service Connection
 * 
 * This file provides easy access to the Level3Service with proper Supabase connection.
 * It uses the shared Supabase client from your existing configuration.
 */

import Level3Service from './level3Service';

// Export the default service class (recommended for most use cases)
export { Level3Service as default };

// Export the service class for advanced use cases
export { Level3Service };

// Export all types for TypeScript support
export type {
  Level3GameData,
  Level3CompletionData,
  Level3Stats,
  Level3ScoreHistory,
  Level3LeaderboardEntry,
  Level3LevelSummary
} from './level3Service';
