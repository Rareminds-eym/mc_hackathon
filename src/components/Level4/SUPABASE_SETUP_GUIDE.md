# Level 4 Supabase Integration Guide

## 🎯 Overview

Your Level 4 system is now ready to save data to Supabase! Here's everything you need to know about using your comprehensive data saving system.

## 🔧 Environment Setup

✅ **Your environment is configured correctly:**
- VITE_SUPABASE_URL: `https://ilwwcxmvprihqcjvlpez.supabase.co`
- VITE_SUPABASE_ANON_KEY: Properly set

## 📁 Files in Your System

1. **`Level4.sql`** - Complete database schema with functions
2. **`migration_time_field.sql`** - Time field migration script
3. **`services/level4services.ts`** - Main service layer (recommended)
4. **`services/level4.ts`** - Alternative service implementation
5. **`services/index.ts`** - Easy import interface
6. **`testSupabaseConnection.ts`** - Test utilities (newly created)
7. **`Level4GameExample.tsx`** - Complete game example (newly created)

## 🚀 Quick Start

### 1. Import the Service
```typescript
import level4Service from './services';
```

### 2. Save Game Data
```typescript
// Basic save with score history
const saveGame = async (userId: string, module: number) => {
  try {
    const result = await level4Service.upsertGameDataWithHistory(
      userId,     // User ID from auth
      module,     // Module number (1, 2, 3, etc.)
      850,        // Score
      true,       // Is completed
      120,        // Time in seconds
      {           // Cases data (your game results)
        case1: { answer: 'A', correct: true },
        case2: { answer: 'B', correct: false }
      }
    );
    
    console.log('✅ Saved successfully:', result);
  } catch (error) {
    console.error('❌ Save failed:', error);
  }
};
```

### 3. Update Existing Data
```typescript
// Update specific fields
await level4Service.updateGameDataWithHistory(userId, module, {
  score: 950,           // New score
  time: 110,           // New time
  updateHistory: true  // Maintain score history
});

// Update completion status only
await level4Service.updateCompletionStatus(userId, module, true);

// Update cases data only
await level4Service.updateCases(userId, module, newCasesData);
```

## 📊 Data Structure

Your database stores:
- **`score`**: Current highest score
- **`score_history`**: Array of top 3 scores (automatically managed)
- **`time`**: Time for the highest score
- **`time_history`**: Array of times corresponding to score_history
- **`cases`**: JSONB object with detailed game data
- **`is_completed`**: Boolean completion status
- **`module`**: Module number
- **`user_id`**: User identifier

## 🧪 Testing Your Setup

### Run Tests
```typescript
import testSuite from './testSupabaseConnection';

// Test everything
await testSuite.runAllTests('your-user-id');

// Test specific functions
await testSuite.testSupabaseConnection();
await testSuite.testSaveGameData('your-user-id');
```

### Example Test in Browser Console
```javascript
// Open your browser console and run:
import('./src/components/Level4/testSupabaseConnection.js')
  .then(module => module.default.runAllTests('test-user-123'));
```

## 📈 Advanced Features

### 1. Score History Tracking
```typescript
// Get past three scores with times
const history = await level4Service.getPastThreeScores(userId, module);
console.log(history);
// {
//   current_score: 950,
//   previous_score: 850, 
//   past_previous_score: 750,
//   current_time_value: 110,
//   previous_time: 120,
//   past_previous_time: 130
// }
```

### 2. User Analytics
```typescript
// Get comprehensive user statistics
const analytics = await level4Service.getUserAnalytics(userId);
console.log(analytics);
// {
//   total_modules: 5,
//   completed_modules: 3,
//   average_score: 825.5,
//   highest_score: 950,
//   lowest_score: 650,
//   total_playtime: 600,
//   improvement_rate: 50.0,
//   completion_rate: 60.0
// }
```

### 3. Leaderboards
```typescript
// Module leaderboard
const moduleLeaderboard = await level4Service.getModuleLeaderboard(1, 10);

// Overall leaderboard
const overallLeaderboard = await level4Service.getOverallLeaderboard(10);
```

### 4. Bulk Operations
```typescript
// Complete multiple modules at once
const updated = await level4Service.bulkUpdateCompletion(
  userId, 
  [1, 2, 3], 
  true
);
console.log(`Updated ${updated} modules`);
```

## 🎮 Real Game Integration

### Basic Integration Pattern
```typescript
const GameComponent = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState({
    score: 0,
    timeElapsed: 0,
    cases: {},
    isCompleted: false
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && !gameState.isCompleted) {
        level4Service.upsertGameDataWithHistory(
          user.id,
          moduleNumber,
          gameState.score,
          false, // Not completed yet
          gameState.timeElapsed,
          gameState.cases
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, gameState]);

  // Save on completion
  const completeGame = async () => {
    if (!user) return;
    
    await level4Service.upsertGameDataWithHistory(
      user.id,
      moduleNumber,
      gameState.score,
      true, // Completed
      gameState.timeElapsed,
      gameState.cases
    );
    
    setGameState(prev => ({ ...prev, isCompleted: true }));
  };

  return (
    // Your game UI
  );
};
```

## 🔒 Security Features

Your system includes:
- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication required**: All operations require valid user session
- **Data validation**: SQL functions validate input parameters
- **Error handling**: Comprehensive error messages

## 🐛 Troubleshooting

### Common Issues

1. **"No user found"**
   - Ensure user is authenticated before calling service methods
   - Check `user.id` is available

2. **"No game data found"**
   - Use `upsertGameDataWithHistory()` instead of update functions for new records
   - Check if user has played the module before

3. **Database connection errors**
   - Verify environment variables are set correctly
   - Check Supabase project status

4. **RLS policy errors**
   - Ensure user is properly authenticated
   - Check user ID matches the data being accessed

### Debug Commands
```typescript
// Check connection
await level4Service.testSupabaseConnection();

// Check user data
const userData = await level4Service.getUserGameData(userId);
console.log('User data:', userData);

// Check specific module
const moduleData = await level4Service.getUserModuleData(userId, module);
console.log('Module data:', moduleData);
```

## 🎯 Best Practices

1. **Always use `upsertGameDataWithHistory()`** for game completions
2. **Handle errors gracefully** with try-catch blocks
3. **Auto-save progress** during gameplay
4. **Validate user authentication** before database operations
5. **Use specific update functions** for partial updates
6. **Test thoroughly** with the provided test suite

## 📞 Need Help?

1. Run the test suite: `testSupabaseConnection.runAllTests()`
2. Check browser console for detailed error messages
3. Verify your Supabase project is active
4. Ensure all SQL functions are deployed

Your system is ready to go! 🚀
