// All Level 2 (solution round) API and helper functions should go here.
// Example: saveLevel2Attempt, fetchLevel2Cases, etc.

import { saveLevel2Progress, getLevel2Progress, Level2Progress, saveLevel2TimerState, getLevel2TimerState, markScreenCompleteWithTimer } from './level2ProgressHelpers';

/**
 * Save Level 2 progress for the user.
 * Call this after each screen is completed or timer is updated.
 */
export async function saveHL2Progress({ user_id, current_screen, completed_screens }: Level2Progress) {
	return saveLevel2Progress({ user_id, current_screen, completed_screens });
}

/**
 * Restore Level 2 progress for the user.
 * Returns the progress object or null if not found.
 */
export async function restoreHL2Progress(user_id: string): Promise<Level2Progress | null> {
	const data = await getLevel2Progress(user_id);
	if (!data) return null;
	return {
		user_id: data.user_id,
		current_screen: data.current_screen,
		completed_screens: Array.isArray(data.completed_screens) ? data.completed_screens : [],
		timer: data.timer,
	};
}

/**
 * Utility to determine the next screen to show based on progress.
 * Returns the next screen index (1-4) and completed screens array.
 */
export function getNextHL2Screen(progress: Level2Progress, totalScreens = 4): { nextScreen: number, completed: number[] } {
	const completed = progress.completed_screens || [];
	// Find the first screen not in completed, or fallback to current_screen
	for (let i = 1; i <= totalScreens; i++) {
		if (!completed.includes(i)) return { nextScreen: i, completed };
	}
	// All screens completed
	return { nextScreen: totalScreens, completed };
}

// Export the new enhanced timer utilities
export { saveLevel2TimerState, getLevel2TimerState, markScreenCompleteWithTimer };
