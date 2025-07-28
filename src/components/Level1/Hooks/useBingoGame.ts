import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer, setSelectedCells, setSelectedDefinition, saveState } from '../../../store/slices/bingoSlice';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface BingoCell {
  id: number;
  term: string;
  definition: string;
  selected: boolean;
}

interface AnswerFeedback {
  isVisible: boolean;
  isCorrect: boolean;
  selectedTerm: string;
  correctDefinition: string;
}

interface Level1GameData {
  user_id: string;
  username?: string;
  game_start_time: string;
  game_end_time?: string;
  total_time_seconds: number;
  score: number;
  rows_solved: number;
  cells_selected: number[];
  completed_lines: number[][];
  board_state: number[][];
  is_completed: boolean;
  current_definition?: string;
  session_id?: string;
  is_restarted?: boolean;
  // Allow extra fields for module_number, level_number, etc.
  [key: string]: unknown;
}

interface BingoState {
  timer: number;
  score: number;
  completedLines: number;
  boardState: number[][];
  selectedCells: number[];
  selectedDefinition: string;
  completedLinesState: number[][];
  rowsSolved: number;
}

interface UseBingoGameOptions {
  questions: { term: string; definition: string }[];
  moduleId: string | number;
}

export const useBingoGame = (options: UseBingoGameOptions) => {
   if (!options.moduleId) {
    throw new Error("❌ useBingoGame: Missing `moduleId`. Each module must pass its ID to isolate its game data.");
  }

  const moduleNumber = Number(options.moduleId);
  // Track if last answer was correct
  const [wasAnswerCorrect, setWasAnswerCorrect] = useState(false);
  // Stateless random picker for definition
  const selectRandomDefinitionFromCells = (cells: BingoCell[]) => {
    const unselectedCells = cells.filter(cell => !cell.selected);
    if (unselectedCells.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * unselectedCells.length);
    return unselectedCells[randomIndex].definition;
  };
  const { user } = useAuth();
  // Log options.questions and moduleId on hook initialization
  console.log('[BingoGame] useBingoGame options:', options);
  console.log('🧩 Using module ID:', options.moduleId);
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [isSaving, setIsSaving] = useState(false); // Loader for saving progress
  const [isRestarting, setIsRestarting] = useState(false); // Loader for restarting game
  const [isResuming, setIsResuming] = useState(false); // Loader for loading/resuming game
  const [completedLines, setCompletedLines] = useState<number[][]>([]);
  const [score, setScoreState] = useState(0);
  const [rowsSolved, setRowsSolved] = useState(0);
  const [selectedDefinition, setSelectedDefinitionState] = useState<string>('');
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback>({
    isVisible: false,
    isCorrect: false,
    selectedTerm: '',
    correctDefinition: ''
  });
  const [gameComplete, setGameComplete] = useState(false);
  const [timer, setTimerState] = useState(0);
  const [completedLineModal, setCompletedLineModal] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [timerActive, setTimerActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGameCompleteModal, setShowGameCompleteModal] = useState(false); // NEW: persist modal state
  const [countdown, setCountdown] = useState<number | null>(null); // NEW: for Play Again countdown
  const dispatch = useDispatch();
  const [hasConfettiFired, setHasConfettiFired] = useState(false);


  // Helper to get active questions strictly from props
  const getActiveQuestions = useCallback(() => {
    console.log('[Hook] Incoming questions:', options.questions);
    if (Array.isArray(options.questions) && options.questions.length > 0) {
      return options.questions;
    }
    throw new Error('❌ No valid questions provided for this module!');
  }, [options.questions]);

  // Generate unique session ID based on user ID
  const generateSessionId = () => {
    return user ? `user_${user.id}_${Date.now()}` : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Save game progress to Supabase (does NOT update history unless told)
  const saveGameToDatabase = useCallback(async (gameData: Partial<Level1GameData>, opts?: { updateHistory?: boolean; resetHistory?: boolean }) => {
    // Helper to update score/timer history only on game end or play again
    const updateAttemptHistory = async (score: number, timer: number) => {
      if (!user) return { score_history: [score], timer_history: [timer] };
      let score_history: number[] = [];
      let timer_history: number[] = [];
      const { data: existing, error: fetchError } = await supabase
        .from('level_1')
        .select('score_history, timer_history')
        .eq('user_id', user.id)
        .eq('module_number', moduleNumber)
        .eq('level_number', 1)
        .order('game_start_time', { ascending: false })
        .limit(1);
      if (!fetchError && existing && existing.length > 0) {
        score_history = Array.isArray(existing[0].score_history) ? existing[0].score_history : [];
        timer_history = Array.isArray(existing[0].timer_history) ? existing[0].timer_history : [];
      }
      // Add new attempt if this (score, timer) pair is not already present in the last 3
      const pairExists = score_history.some((s, i) => s === score && timer_history[i] === timer);
      if (!pairExists) {
        score_history = [...score_history, score];
        timer_history = [...timer_history, timer];
      }
      // Only keep the last 3 unique attempts
      if (score_history.length > 3) {
        // Remove oldest so that both arrays stay in sync
        score_history = score_history.slice(-3);
        timer_history = timer_history.slice(-3);
      }
      return { score_history, timer_history };
    };

    if (!user) return;
    setIsSaving(true);
    try {
      let score_history: number[] = [];
      let timer_history: number[] = [];
      let saveScore = score;
      let saveTimer = timer;
      // Only update history if requested (on game end or play again)
      if (opts && opts.updateHistory) {
        const result = await updateAttemptHistory(gameData.score ?? score, gameData.total_time_seconds ?? timer);
        score_history = result.score_history;
        timer_history = result.timer_history;
        if (typeof gameData.score === 'number') saveScore = gameData.score;
        if (typeof gameData.total_time_seconds === 'number') saveTimer = gameData.total_time_seconds;
      } else if (opts && opts.resetHistory) {
        // On restart, reset attempt, do NOT update history
        score_history = [];
        timer_history = [];
      }
      // For in-progress saves, always use current score/timer, never from gameData, and do NOT update history
      if (!opts || (!opts.updateHistory && !opts.resetHistory)) {
        saveScore = score;
        saveTimer = timer;
        // Do not set score_history/timer_history at all
      }

      // Always include score_history/timer_history if updating or resetting history (even if empty)
      let historyFields = {};
      if (opts && (opts.updateHistory || opts.resetHistory)) {
        historyFields = { ...historyFields, score_history, timer_history };
      }

      const dataToSave = {
        user_id: user.id,
        username: user.user_metadata?.full_name || user.email || 'Unknown User',
        session_id: sessionId,
        total_time_seconds: saveTimer,
        score: saveScore,
        ...historyFields,
        rows_solved: rowsSolved,
        cells_selected: gameData.cells_selected || cells.filter(cell => cell.selected).map(cell => cell.id),
        completed_lines: gameData.completed_lines || completedLines,
        board_state: gameData.board_state || [
          cells.map(cell => cell.selected ? 1 : 0).slice(0, 5),
          cells.map(cell => cell.selected ? 1 : 0).slice(5, 10),
          cells.map(cell => cell.selected ? 1 : 0).slice(10, 15),
          cells.map(cell => cell.selected ? 1 : 0).slice(15, 20),
          cells.map(cell => cell.selected ? 1 : 0).slice(20, 25),
        ],
        is_completed: gameComplete,
        current_definition: selectedDefinition,
        game_start_time: gameStartTime,
        module_number: moduleNumber, // Added for Level 1
        level_number: 1,  // Added for Level 1
        ...Object.fromEntries(Object.entries(gameData).filter(([k]) => k !== 'score' && k !== 'total_time_seconds'))
      };

      // First try to update existing record for this user, module, and level
      const { data: updateData, error: updateError } = await supabase
        .from('level_1')
        .update(dataToSave)
        .eq('user_id', user.id)
        .eq('module_number', moduleNumber)
        .eq('level_number', 1)
        .select();

      let data, error;
      
      if (updateError || !updateData || updateData.length === 0) {
        // No existing record found, insert new one
        const { data: insertData, error: insertError } = await supabase
          .from('level_1')
          .insert(dataToSave)
          .select();
        
        data = insertData;
        error = insertError;
      } else {
        data = updateData;
        error = updateError;
      }

      if (error) {
        console.warn('Database save failed (table might not exist):', error.message);
        // Don't throw error, just log it - game should continue working
      } else {
        console.log('Game saved successfully:', data);
      }
    } catch (error) {
      console.warn('Error in saveGameToDatabase (continuing without database):', error);
      // Game continues to work without database
    } finally {
      setIsSaving(false);
    }
  }, [user, sessionId, timer, score, rowsSolved, cells, completedLines, gameComplete, selectedDefinition, gameStartTime]);

  // Load game progress from Supabase
  const loadGameFromDatabase = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('level_1')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_number', moduleNumber)  // ✅ Filter by module!
        .eq('level_number', 1)
        .order('game_start_time', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Database load failed (table might not exist):', error.message);
        return null; // Return null so game uses Redux fallback
      }

      if (data && data.length > 0) {
        // Always use the current score and total_time_seconds fields, not history, for in-progress or restarted games
        const game = data[0];
        return {
          ...game,
          // Defensive: never use score_history/timer_history for in-progress display
          score: typeof game.score === 'number' ? game.score : 0,
          total_time_seconds: typeof game.total_time_seconds === 'number' ? game.total_time_seconds : 0,
        };
      }
      return null;
    } catch (error) {
      console.warn('Error in loadGameFromDatabase (using Redux fallback):', error);
      return null; // Return null so game uses Redux fallback
    }
  }, [user, moduleNumber]);

  const triggerGameCompleteConfetti = useCallback(() => {
    // Multiple confetti bursts for game completion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Mark game as completed in database (only once per game)
  // Mark game as completed in database (only once per game)
  const markGameCompleted = useCallback(async (finalScore?: number, finalTimer?: number, finalRowsSolved?: number) => {
    if (!user) return;
    // Prevent duplicate completion for the same session
    if (window.__bingoGameCompletedSession === sessionId) return;
    window.__bingoGameCompletedSession = sessionId;
    try {
      await saveGameToDatabase({
        is_completed: true,
        game_end_time: new Date().toISOString(),
        total_time_seconds: typeof finalTimer === 'number' ? finalTimer : timer,
        score: typeof finalScore === 'number' ? finalScore : score,
        rows_solved: typeof finalRowsSolved === 'number' ? finalRowsSolved : rowsSolved,
        username: user.user_metadata?.full_name || user.email || 'Unknown User',
        module_number: moduleNumber,
        level_number: 1,
      }, { updateHistory: true });
    } catch (error) {
      console.warn('Error in markGameCompleted (continuing without database):', error);
    }
  }, [user, timer, score, rowsSolved, saveGameToDatabase, sessionId, moduleNumber]);

  const selectRandomDefinition = useCallback((currentCells: BingoCell[]) => {
    const unselectedCells = currentCells.filter(cell => !cell.selected);
    if (unselectedCells.length > 0) {
      const randomCell = unselectedCells[Math.floor(Math.random() * unselectedCells.length)];
      setSelectedDefinitionState(randomCell.definition);
      dispatch(setSelectedDefinition(randomCell.definition));
      // Save the new definition to database
      if (user && sessionId) {
        saveGameToDatabase({
          current_definition: randomCell.definition
        });
      }
    } else {
      // All cells are selected, but do NOT mark game complete here
      // Game completion is now handled in checkForNewLines when all Bingo lines are completed
      setSelectedDefinitionState('');
      dispatch(setSelectedDefinition(''));
    }
  }, [dispatch, triggerGameCompleteConfetti, markGameCompleted, user, sessionId, saveGameToDatabase, score, timer, rowsSolved]);

  const initializeGame = useCallback(() => {
    const newSessionId = generateSessionId();
    let activeQuestions;
    try {
      activeQuestions = getActiveQuestions();
    } catch (err) {
      console.error(err);
      return;
    }
    console.log('[BingoGame] Using question source:', activeQuestions);
    const newCells: BingoCell[] = activeQuestions.map((q, i) => ({
      id: i,
      term: q.term,
      definition: q.definition,
      selected: i === 24 // Free Space
    }));
    setCells(newCells);
    setCompletedLines([]);
    setRowsSolved(0);
    setScoreState(0);
    setGameComplete(false);
    setTimerState(0);
    setGameStartTime(new Date().toISOString());
    setSessionId(newSessionId);
    // Pick fresh random definition immediately
    const randomDef = selectRandomDefinitionFromCells(newCells);
    setSelectedDefinitionState(randomDef);
    dispatch(setSelectedDefinition(randomDef));
    setIsInitialized(true);
    if (user) {
      supabase.from('level_1').update({
        score: 0,
        total_time_seconds: 0,
        is_completed: false,
        is_restarted: false,
        rows_solved: 0,
        cells_selected: [24],
        completed_lines: [],
        board_state: [
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
        ],
        current_definition: randomDef, // always fresh one!
        module_number: moduleNumber,
        level_number: 1,
        session_id: newSessionId,
        game_start_time: new Date().toISOString(),
        score_history: undefined,
        timer_history: undefined,
      }).eq('user_id', user.id).eq('module_number', moduleNumber).eq('level_number', 1);
    }
  }, [user, options.moduleId, getActiveQuestions, generateSessionId, moduleNumber]);

  // Restore state from Redux or Database on mount or when questions change
  useEffect(() => {
    if (!isInitialized && options.questions && options.questions.length > 0) {
      initializeGame();
    }
  }, [options.questions, isInitialized, initializeGame]);

  // Sanity check for questions
  useEffect(() => {
    if (!options.questions || options.questions.length !== 25) {
      console.error('❌ Bingo Game: options.questions is missing or does not contain exactly 25 items.');
    }
  }, [options.questions]);

  // Timer logic (controlled internally)
  useEffect(() => {
    // Pause timer if answer feedback or completed line modal is visible
    if (gameComplete || !timerActive || answerFeedback.isVisible || completedLineModal) return;
    const interval = setInterval(() => {
      setTimerState((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameComplete, timerActive, answerFeedback.isVisible, completedLineModal]);
  useEffect(() => {
  if (user && !isInitialized && options.moduleId) {
    loadGameFromDatabase().then(loaded => {
      if (loaded?.is_completed) {
        console.log('🟢 Saved game is complete. Starting new fresh game.');
        initializeGame();
        return;
      }
      if (loaded && loaded.cells_selected?.length) {
        console.log('🟢 Restoring unfinished game...');
        const loadedCells = getActiveQuestions().map((q, i) => ({
          id: i,
          term: q.term,
          definition: q.definition,
          selected: loaded.cells_selected.includes(i)
        }));

        setCells(loadedCells);

        // ✅ Restore score, timer, rows solved, etc.
        setScoreState(loaded.score ?? 0);
        setRowsSolved(loaded.rows_solved ?? 0);
        setTimerState(loaded.total_time_seconds ?? 0);
        const matchedCell = loadedCells.find(cell => cell.definition === loaded.current_definition);

        // Only restore if the definition hasn’t been matched (selected = false)
        if (matchedCell && !matchedCell.selected) {
          setSelectedDefinitionState(loaded.current_definition);
          dispatch(setSelectedDefinition(loaded.current_definition));
        } else {
          // Select a new definition if it was already matched
          const newDef = selectRandomDefinitionFromCells(loadedCells);
          setSelectedDefinitionState(newDef);
          dispatch(setSelectedDefinition(newDef));
        }

        setCompletedLines(loaded.completed_lines ?? []);
        setGameStartTime(loaded.game_start_time ?? '');
        setSessionId(loaded.session_id ?? generateSessionId());

        // ✅ Patch Redux store too
        dispatch(saveState({
          timer: loaded.total_time_seconds ?? 0,
          score: loaded.score ?? 0,
          completedLines: loaded.completed_lines?.length ?? 0,
          completedLinesState: loaded.completed_lines ?? [],
          rowsSolved: loaded.rows_solved ?? 0,
          boardState: loaded.board_state ?? [],
          selectedCells: loaded.cells_selected ?? [],
          selectedDefinition: loaded.current_definition ?? '',
          is_completed: loaded.is_completed ?? false,
        }));

        // ✅ Mark as initialized to avoid double init
        setIsInitialized(true);
      } else {
        // ✅ If no saved game, start fresh
        initializeGame();
      }
    });
  }
}, [user , isInitialized, options.moduleId , loadGameFromDatabase]);

   useEffect(() => {
  if (gameComplete && !hasConfettiFired) {
    console.log("🎉 Running confetti because gameComplete = true");
    triggerGameCompleteConfetti();
    setShowGameCompleteModal(true);
    // Delay modal to ensure score is updated
    const timeout = setTimeout(() => {
      setShowGameCompleteModal(true);
    }, 100); // 100ms delay is usually enough
       return () => clearTimeout(timeout);
  }
}, [gameComplete, hasConfettiFired,triggerGameCompleteConfetti]);
  // Timer control functions
  const startTimer = useCallback(() => setTimerActive(true), []);
  const stopTimer = useCallback(() => setTimerActive(false), []);

  // Timer logic (start/stop externally, but always save to Redux)
  useEffect(() => {
    dispatch(setTimer(timer));
  }, [timer, dispatch]);

  // Save the current game state to Redux whenever relevant state changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save until initialized
    
    dispatch(saveState({
      timer,
      score,
      completedLines: completedLines.length,
      completedLinesState: completedLines, // Save the actual completed lines
      rowsSolved, // Save rowsSolved
      boardState: [
        cells.map(cell => cell.selected ? 1 : 0).slice(0, 5),
        cells.map(cell => cell.selected ? 1 : 0).slice(5, 10),
        cells.map(cell => cell.selected ? 1 : 0).slice(10, 15),
        cells.map(cell => cell.selected ? 1 : 0).slice(15, 20),
        cells.map(cell => cell.selected ? 1 : 0).slice(20, 25),
      ],
      selectedCells: cells.filter(cell => cell.selected).map(cell => cell.id),
      selectedDefinition,
      is_completed: gameComplete,
    }));
  }, [timer, score, completedLines, cells, selectedDefinition, rowsSolved, dispatch, isInitialized, gameComplete]);

  // Separate effect for periodic database saves (every 30 seconds)
  useEffect(() => {
    if (!isInitialized || !user || !sessionId || gameComplete) return;
    
    const saveInterval = setInterval(() => {
      saveGameToDatabase({});
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [user, sessionId, gameComplete, saveGameToDatabase, isInitialized]);

  const toggleCell = (id: number) => {
    if (gameComplete || answerFeedback.isVisible) return;
    const clickedCell = cells.find(cell => cell.id === id);
    if (!clickedCell || clickedCell.selected) return;

    // Debug logging to help identify the issue
    console.log('Clicked cell:', clickedCell.term, '- Definition:', clickedCell.definition);
    console.log('Current definition shown:', selectedDefinition);
    console.log('Definition lengths:', clickedCell.definition.length, 'vs', selectedDefinition.length);

    // More robust comparison that handles potential whitespace/encoding issues
    const normalizeString = (str: string) => str.trim().replace(/\s+/g, ' ');
    const cellDefNormalized = normalizeString(clickedCell.definition);
    const selectedDefNormalized = normalizeString(selectedDefinition);

    console.log('Normalized cell definition:', cellDefNormalized);
    console.log('Normalized selected definition:', selectedDefNormalized);

    // Show feedback modal
    const isCorrect = cellDefNormalized === selectedDefNormalized;
    console.log('Is correct match:', isCorrect);

    setAnswerFeedback({
      isVisible: true,
      isCorrect,
      selectedTerm: clickedCell.term,
      correctDefinition: selectedDefinition
    });
    setWasAnswerCorrect(isCorrect);

    // If correct, update the cell
    if (isCorrect) {
      const newCells = cells.map(cell =>
        cell.id === id ? { ...cell, selected: true } : cell
      );
      setCells(newCells);
      dispatch(setSelectedCells(newCells.filter(cell => cell.selected).map(cell => cell.id)));

      // Save game progress to database with updated cell data
      saveGameToDatabase({
        cells_selected: newCells.filter(cell => cell.selected).map(cell => cell.id),
        board_state: [
          newCells.map(cell => cell.selected ? 1 : 0).slice(0, 5),
          newCells.map(cell => cell.selected ? 1 : 0).slice(5, 10),
          newCells.map(cell => cell.selected ? 1 : 0).slice(10, 15),
          newCells.map(cell => cell.selected ? 1 : 0).slice(15, 20),
          newCells.map(cell => cell.selected ? 1 : 0).slice(20, 25),
        ]
      });

      // Check for new lines after a short delay
      setTimeout(() => {
        checkForNewLines(newCells);
      }, 100);
    }
  };

  const closeAnswerModal = () => {
    setAnswerFeedback(prev => ({ ...prev, isVisible: false }));
    if (wasAnswerCorrect) {
    setTimeout(() => {
      selectRandomDefinition(cells);
    }, 300);
    }
  };

  const checkForNewLines = (currentCells: BingoCell[]) => {
    const patterns = [
      // Rows
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      // Columns
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      // Diagonals
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];

    const newCompletedLines: number[][] = [];
    let newLineTriggered = false;
    for (const pattern of patterns) {
      const isComplete = pattern.every(index => currentCells[index].selected);
      if (isComplete) {
        // Check if this line is already completed
        const isAlreadyCompleted = completedLines.some(line => 
          line.length === pattern.length && line.every(id => pattern.includes(id))
        );
        if (!isAlreadyCompleted) {
          newCompletedLines.push(pattern);
          triggerLineCompleteConfetti();
          newLineTriggered = true;
        }
      }
    }

    if (newCompletedLines.length > 0) {
      const newCompletedLinesState = [...completedLines, ...newCompletedLines];
      const newRowsSolved = rowsSolved + newCompletedLines.length;
      const newScore = score + newCompletedLines.length * 10;
      
      setCompletedLines(newCompletedLinesState);
      setRowsSolved(newRowsSolved);
      setScoreState(newScore);
      if (newLineTriggered) setCompletedLineModal(true);
      
      // Save game progress to database with updated values
      saveGameToDatabase({
        completed_lines: newCompletedLinesState,
        rows_solved: newRowsSolved,
        score: newScore,
        cells_selected: currentCells.filter(cell => cell.selected).map(cell => cell.id),
        board_state: [
          currentCells.map(cell => cell.selected ? 1 : 0).slice(0, 5),
          currentCells.map(cell => cell.selected ? 1 : 0).slice(5, 10),
          currentCells.map(cell => cell.selected ? 1 : 0).slice(10, 15),
          currentCells.map(cell => cell.selected ? 1 : 0).slice(15, 20),
          currentCells.map(cell => cell.selected ? 1 : 0).slice(20, 25),
        ]
      });

      // If all Bingo lines are completed, mark game as complete and persist it
      const totalPatterns = patterns.length;
      if (newCompletedLinesState.length >= totalPatterns) {
        console.log('✅ All lines done!');
        setGameComplete(true);
        triggerGameCompleteConfetti();
        markGameCompleted(newScore, timer, newRowsSolved);
        // Do NOT auto-reset the board. Let the modal handle next steps.
      }
    }
  };

  const closeCompletedLineModal = () => setCompletedLineModal(false);

  const triggerLineCompleteConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
    });
  };

  const saveGameState = () => {
    dispatch(saveState({
      timer,
      score,
      completedLines: completedLines.length,
      completedLinesState: completedLines,
      rowsSolved,
      boardState: [
        cells.map(cell => cell.selected ? 1 : 0).slice(0, 5),
        cells.map(cell => cell.selected ? 1 : 0).slice(5, 10),
        cells.map(cell => cell.selected ? 1 : 0).slice(10, 15),
        cells.map(cell => cell.selected ? 1 : 0).slice(15, 20),
        cells.map(cell => cell.selected ? 1 : 0).slice(20, 25),
      ],
      selectedCells: cells.filter(cell => cell.selected).map(cell => cell.id),
      selectedDefinition,
    }));
  };

  // Play Again: Save current attempt to history, then start new game (for GameCompleteModal)
  const playAgain = async () => {
    setAnswerFeedback({
      isVisible: false,
      isCorrect: false,
      selectedTerm: '',
      correctDefinition: ''
    });
    setShowGameCompleteModal(false); // Hide modal
    // Save the completed attempt to history BEFORE resetting state
    if (user && sessionId) {
      // Capture the current values before any state reset
      const completedScore = score;
      const completedTimer = timer;
      const completedRowsSolved = rowsSolved;
      await saveGameToDatabase({
        is_completed: true,
        game_end_time: new Date().toISOString(),
        total_time_seconds: completedTimer,
        score: completedScore,
        rows_solved: completedRowsSolved,
        username: user.user_metadata?.full_name || user.email || 'Unknown User',
        module_number: moduleNumber,
        level_number: 1,
      }, { updateHistory: true });
    }
    // Reset timer and score BEFORE starting a new game
    setScoreState(0);
    setTimerState(0);
    // Start countdown before initializing new game
    setCountdown(3); // 3 second countdown
    let countdownValue = 3;
    const countdownInterval = setInterval(() => {
      countdownValue -= 1;
      setCountdown(countdownValue);
      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        // Now initialize the game
        initializeGame();
        // Reset Redux state after new game is initialized
        dispatch(saveState({
          timer: 0,
          score: 0,
          completedLines: 0,
          completedLinesState: [],
          rowsSolved: 0,
          boardState: [],
          selectedCells: [],
          selectedDefinition: '',
        }));
        // Save the reset state to DB for the new attempt (score: 0, timer: 0, etc.)
        // DO NOT update history for the new attempt, and DO NOT send score_history/timer_history fields
        if (user && sessionId) {
          saveGameToDatabase({
            is_completed: false,
            is_restarted: false,
            game_end_time: undefined,
            total_time_seconds: 0,
            score: 0,
            rows_solved: 0,
            username: user.user_metadata?.full_name || user.email || 'Unknown User',
            module_number: moduleNumber,
            level_number: 1,
            cells_selected: [24],
            completed_lines: [],
            board_state: [
              [0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0],
              [0,0,0,0,0],
            ],
            current_definition: '', // Will be set by selectRandomDefinition
            // Do NOT send score_history or timer_history here!
          });
        }
      }
    }, 1000);
  };


  // Save new game state to DB after sessionId changes (i.e., after restart or play again)
  useEffect(() => {
    if (!isInitialized || !user || !sessionId || gameComplete) return;
    // Only save if the board is at initial state (all unselected except free space)
    // and timer/score are zero (i.e., new game)
    const allUnselected = cells.filter(cell => cell.selected).length === 1 && cells[24].selected;
    if (allUnselected && score === 0 && timer === 0 && completedLines.length === 0) {
      saveGameToDatabase({
        is_completed: false,
        is_restarted: false,
        game_end_time: undefined,
        total_time_seconds: 0,
        score: 0,
        rows_solved: 0,
        username: user.user_metadata?.full_name || user.email || 'Unknown User',
        module_number: moduleNumber,
        level_number: 1,
        cells_selected: [24],
        completed_lines: [],
        board_state: [
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
          [0,0,0,0,0],
        ],
        current_definition: selectedDefinition,
        score_history: undefined,
        timer_history: undefined,
      });
    }
  }, [sessionId , moduleNumber]);

  // Helper: get sorted attempts for modal (highest score, then lowest time)
  // (moved to bottom of file for export)

  const isInCompletedLine = (cellId: number): boolean => {
    return completedLines.some((line: number[]) => line.includes(cellId));
  };



  return {
    cells,
    completedLines,
    score,
    rowsSolved,
    selectedDefinition,
    answerFeedback,
    gameComplete,
    completedLineModal,
    toggleCell,
    playAgain,   // for GameCompleteModal: saves attempt, then new game
    closeAnswerModal,
    closeCompletedLineModal,
    isInCompletedLine,
    saveGameState,
    timer,
    setTimer: setTimerState,
    startTimer,
    stopTimer,
    timerActive,
    isSaving, // Expose loader state
    isRestarting, // Expose restarting loader
    isResuming,   // Expose resume loader
    showGameCompleteModal, // NEW: expose modal state
    setShowGameCompleteModal, // NEW: allow UI to dismiss modal
    countdown, // NEW: expose countdown value
  };
};