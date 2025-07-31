import { GameStorage, TermPlacementResult } from './gameStorage';
import { Term } from '../../types/Level2/types';

/**
 * Debug utility for testing Level 2 localStorage functionality
 */
export class DebugGameStorage {

  /**
   * Run all tests
   */
  static runAllTests(): boolean {
    console.log('🚀 Running all Level2 localStorage tests...');

    const termPlacementTest = this.testTermPlacementResults();
    const termReplacementTest = this.testTermReplacement();

    const allPassed = termPlacementTest && termReplacementTest;

    if (allPassed) {
      console.log('🎉 All Level2 localStorage tests passed!');
    } else {
      console.error('💥 Some Level2 localStorage tests failed!');
    }

    return allPassed;
  }

  /**
   * Clear any legacy game state keys (for testing cleanup)
   */
  static clearLegacyForTesting(): void {
    console.log('🧹 Clearing legacy Level2 game states for testing...');
    GameStorage.clearLegacyLevel2GameStates();
    console.log('✨ Legacy Level2 game states cleared');
  }

  /**
   * Simulate ResultsModal behavior - clear localStorage when "results" are shown
   */
  static simulateResultsModalOpen(moduleId: string = '1'): void {
    console.log('🎭 Simulating ResultsModal open behavior...');

    // Create some test term placement results for the module
    const testData = [
      { gameModeId: 'mode1', type: 1 },
      { gameModeId: 'mode2', type: 2 },
      { gameModeId: 'mode3', type: 3 }
    ];

    testData.forEach(({ gameModeId, type }) => {
      // Create mock term placement results
      const mockResult: TermPlacementResult = {
        termId: `term-${gameModeId}-${type}`,
        termText: `Test Term ${gameModeId}`,
        correctCategory: 'category1',
        placedCategory: 'category1',
        isCorrect: true,
        timestamp: Date.now(),
        moduleId,
        gameModeId,
        type
      };
      GameStorage.saveTermPlacementResult(mockResult);
    });

    console.log('💾 Test term placement data saved to localStorage for module:', moduleId);

    // Clear term placement results for the module
    testData.forEach(({ gameModeId, type }) => {
      GameStorage.clearTermPlacementResults(moduleId, gameModeId, type);
    });

    // Clear any legacy game state keys
    GameStorage.clearLegacyLevel2GameStates();

    console.log('🗑️ All localStorage cleared for module (data would be saved to Supabase)');
    console.log('✅ ResultsModal simulation completed');
  }



  /**
   * Create mock term placement results for testing
   */
  static createMockTermPlacementResults(
    moduleId: string = '1',
    gameModeId: string = 'test-mode',
    type: number = 1
  ): TermPlacementResult[] {
    return [
      {
        termId: 'term1',
        termText: 'Test Term 1',
        correctCategory: 'category1',
        placedCategory: 'category1',
        isCorrect: true,
        timestamp: Date.now() - 3000,
        moduleId,
        gameModeId,
        type
      },
      {
        termId: 'term2',
        termText: 'Test Term 2',
        correctCategory: 'category2',
        placedCategory: 'category1',
        isCorrect: false,
        timestamp: Date.now() - 2000,
        moduleId,
        gameModeId,
        type
      },
      {
        termId: 'term3',
        termText: 'Test Term 3',
        correctCategory: 'category1',
        placedCategory: 'category1',
        isCorrect: true,
        timestamp: Date.now() - 1000,
        moduleId,
        gameModeId,
        type
      }
    ];
  }

  /**
   * Test term placement result storage and retrieval
   */
  static testTermPlacementResults(
    moduleId: string = '1',
    gameModeId: string = 'test-mode',
    type: number = 1
  ): boolean {
    console.log('🧪 Testing term placement result storage...');

    // Create mock placement results
    const mockResults = this.createMockTermPlacementResults(moduleId, gameModeId, type);
    console.log('📝 Mock placement results created:', mockResults);

    // Save each result
    mockResults.forEach(result => {
      GameStorage.saveTermPlacementResult(result);
    });
    console.log('💾 Placement results saved to localStorage');

    // Retrieve results
    const retrievedResults = GameStorage.getTermPlacementResults(moduleId, gameModeId, type);
    console.log('📖 Placement results loaded from localStorage:', retrievedResults);

    // Verify results match
    if (retrievedResults.length !== mockResults.length) {
      console.error('❌ Term placement results count mismatch');
      return false;
    }

    const isValid = mockResults.every(mockResult => {
      const retrieved = retrievedResults.find(r => r.termId === mockResult.termId);
      return retrieved &&
        retrieved.termText === mockResult.termText &&
        retrieved.correctCategory === mockResult.correctCategory &&
        retrieved.placedCategory === mockResult.placedCategory &&
        retrieved.isCorrect === mockResult.isCorrect &&
        retrieved.moduleId === mockResult.moduleId &&
        retrieved.gameModeId === mockResult.gameModeId &&
        retrieved.type === mockResult.type;
    });

    if (isValid) {
      console.log('✅ Term placement results test passed!');
    } else {
      console.error('❌ Term placement results test failed!');
      console.error('Expected:', mockResults);
      console.error('Actual:', retrievedResults);
    }

    // Test clearing results
    GameStorage.clearTermPlacementResults(moduleId, gameModeId, type);
    const clearedResults = GameStorage.getTermPlacementResults(moduleId, gameModeId, type);

    if (clearedResults.length === 0) {
      console.log('✅ Term placement results clear test passed!');
    } else {
      console.error('❌ Term placement results clear test failed!');
      return false;
    }

    return isValid;
  }

  /**
   * Test term placement result re-placement (overwriting previous placement)
   */
  static testTermReplacement(
    moduleId: string = '1',
    gameModeId: string = 'test-mode',
    type: number = 1
  ): boolean {
    console.log('🧪 Testing term re-placement behavior...');

    // Save initial placement
    const initialPlacement: TermPlacementResult = {
      termId: 'term1',
      termText: 'Test Term 1',
      correctCategory: 'category1',
      placedCategory: 'category2',
      isCorrect: false,
      timestamp: Date.now() - 1000,
      moduleId,
      gameModeId,
      type
    };

    GameStorage.saveTermPlacementResult(initialPlacement);
    console.log('💾 Initial placement saved:', initialPlacement);

    // Save corrected placement for same term
    const correctedPlacement: TermPlacementResult = {
      termId: 'term1',
      termText: 'Test Term 1',
      correctCategory: 'category1',
      placedCategory: 'category1',
      isCorrect: true,
      timestamp: Date.now(),
      moduleId,
      gameModeId,
      type
    };

    GameStorage.saveTermPlacementResult(correctedPlacement);
    console.log('💾 Corrected placement saved:', correctedPlacement);

    // Retrieve results
    const results = GameStorage.getTermPlacementResults(moduleId, gameModeId, type);
    console.log('📖 Retrieved results:', results);

    // Should only have one result for term1, and it should be the corrected one
    const term1Results = results.filter(r => r.termId === 'term1');

    if (term1Results.length === 1 && term1Results[0].isCorrect === true && term1Results[0].placedCategory === 'category1') {
      console.log('✅ Term re-placement test passed!');
      GameStorage.clearTermPlacementResults(moduleId, gameModeId, type);
      return true;
    } else {
      console.error('❌ Term re-placement test failed!');
      console.error('Expected: 1 result with isCorrect=true, placedCategory=category1');
      console.error('Actual:', term1Results);
      GameStorage.clearTermPlacementResults(moduleId, gameModeId, type);
      return false;
    }
  }
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).DebugGameStorage = DebugGameStorage;
}
