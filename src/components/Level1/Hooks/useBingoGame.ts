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

const BINGO_DATA = [
  { term: 'GMP', definition: 'Regulations ensuring products are consistently produced and controlled to quality standards.' },
  { term: 'SOP', definition: 'A document providing detailed instructions to carry out specific tasks consistently.' },
  { term: 'CAPA', definition: 'A system used to correct and prevent issues in quality processes.' },
  { term: 'Audit', definition: 'A formal examination of processes and records to ensure compliance with standards.' },
  { term: 'Facility', definition: 'The physical premises where manufacturing or testing occurs.' },
  { term: 'Cleanroom', definition: 'A controlled environment with low levels of contaminants for sterile manufacturing.' },
  { term: 'OOS', definition: 'Abbreviation for results that fall outside specified acceptance criteria.' },
  { term: 'Validation', definition: 'Documented evidence that a system or process consistently produces expected results.' },
  { term: 'CDSCO', definition: 'India\'s national regulatory body for pharmaceuticals and medical devices.' },
  { term: 'Hygiene', definition: 'Practices and conditions that help maintain health and prevent contamination.' },
  { term: 'Contamination', definition: 'The unintended presence of harmful substances in products or environments.' },
  { term: 'QA', definition: 'A department responsible for ensuring processes meet quality standards.' },
  { term: 'Batch Record', definition: 'A document detailing the history of the production and testing of a batch.' },
  { term: 'WHO', definition: 'An international public health organization setting global quality and safety standards.' },
  { term: 'RCA', definition: 'A method used to identify the root cause of problems or failures.' },
  { term: 'Equipment', definition: 'Machines or tools used in the manufacturing process.' },
  { term: 'Documentation', definition: 'Written records that support every step of the manufacturing process.' },
  { term: 'Gowning', definition: 'The procedure of wearing sterile protective clothing in clean areas.' },
  { term: 'QA Head', definition: 'The person responsible for overseeing the Quality Assurance department.' },
  { term: 'Inspection', definition: 'An official review by regulators to ensure compliance with GMP.' },
  { term: 'Training', definition: 'Teaching employees to understand and follow GMP procedures.' },
  { term: 'Logs', definition: 'Records of events or processes maintained for traceability.' },
  { term: 'Process', definition: 'A series of actions or steps taken to manufacture a product.' },
  { term: 'Raw Material', definition: 'The basic substance used in the production of goods.' },
  { term: 'Free Space', definition: 'A pre-filled space to aid Bingo progression.' }
];

export const useBingoGame = () => {
  const { user } = useAuth();
  const [cells, setCells] = useState<BingoCell[]>([]);
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
  const dispatch = useDispatch();
  const bingoRedux = useSelector((state: { bingo: BingoState }) => state.bingo);

  // Generate unique session ID based on user ID
  const generateSessionId = () => {
    return user ? `user_${user.id}_${Date.now()}` : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Save game progress to Supabase
  // Helper to update score/timer history only on game end or play again
  const updateAttemptHistory = async (score: number, timer: number) => {
    if (!user) return { score_history: [score], timer_history: [timer] };
    let score_history: number[] = [];
    let timer_history: number[] = [];
    const { data: existing, error: fetchError } = await supabase
      .from('level_1')
      .select('score_history, timer_history')
      .eq('user_id', user.id)
      .eq('module_number', 1)
      .eq('level_number', 1)
      .order('game_start_time', { ascending: false })
      .limit(1);
    if (!fetchError && existing && existing.length > 0) {
      score_history = Array.isArray(existing[0].score_history) ? existing[0].score_history : [];
      timer_history = Array.isArray(existing[0].timer_history) ? existing[0].timer_history : [];
    }
    score_history = [...score_history, score].slice(-3);
    timer_history = [...timer_history, timer].slice(-3);
    return { score_history, timer_history };
  };

  // Save game progress to Supabase (does NOT update history unless told)
  const saveGameToDatabase = useCallback(async (gameData: Partial<Level1GameData>, opts?: { updateHistory?: boolean; resetHistory?: boolean }) => {
    if (!user) return;

    try {
      let score_history: number[] = [];
      let timer_history: number[] = [];
      if (opts && opts.updateHistory) {
        // Only update history if requested (on game end or play again)
        const result = await updateAttemptHistory(gameData.score ?? score, gameData.total_time_seconds ?? timer);
        score_history = result.score_history;
        timer_history = result.timer_history;
      } else if (opts && opts.resetHistory) {
        // On restart, reset attempt
        score_history = [];
        timer_history = [];
      }

      const dataToSave = {
        user_id: user.id,
        username: user.user_metadata?.full_name || user.email || 'Unknown User',
        session_id: sessionId,
        total_time_seconds: timer,
        score,
        score_history: score_history.length ? score_history : undefined,
        timer_history: timer_history.length ? timer_history : undefined,
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
        module_number: 1, // Added for Level 1
        level_number: 1,  // Added for Level 1
        ...gameData
      };

      // First try to update existing record for this user, module, and level
      const { data: updateData, error: updateError } = await supabase
        .from('level_1')
        .update(dataToSave)
        .eq('user_id', user.id)
        .eq('module_number', 1)
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
    }
  }, [user, sessionId, timer, score, rowsSolved, cells, completedLines, gameComplete, selectedDefinition, gameStartTime, updateAttemptHistory]);

  // Load game progress from Supabase
  const loadGameFromDatabase = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('level_1')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .order('game_start_time', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Database load failed (table might not exist):', error.message);
        return null; // Return null so game uses Redux fallback
      }

      // Only return saved game if it exists and is not a restarted game
      if (data && data.length > 0) {
        // If score_history/timer_history exist, use the latest value for display
        const game = data[0];
        if (Array.isArray(game.score_history) && game.score_history.length > 0) {
          game.score = game.score_history[game.score_history.length - 1];
        }
        if (Array.isArray(game.timer_history) && game.timer_history.length > 0) {
          game.total_time_seconds = game.timer_history[game.timer_history.length - 1];
        }
        return game;
      }
      return null;
    } catch (error) {
      console.warn('Error in loadGameFromDatabase (using Redux fallback):', error);
      return null; // Return null so game uses Redux fallback
    }
  }, [user]);

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

  // Mark game as completed in database
  // On game complete, update history
  const markGameCompleted = useCallback(async () => {
    if (!user) return;
    try {
      await saveGameToDatabase({
        is_completed: true,
        game_end_time: new Date().toISOString(),
        total_time_seconds: timer,
        score,
        rows_solved: rowsSolved,
        username: user.user_metadata?.full_name || user.email || 'Unknown User',
        module_number: 1,
        level_number: 1,
      }, { updateHistory: true });
    } catch (error) {
      console.warn('Error in markGameCompleted (continuing without database):', error);
    }
  }, [user, timer, score, rowsSolved, saveGameToDatabase]);

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
      // All cells are selected, game is complete
      setGameComplete(true);
      triggerGameCompleteConfetti();
      markGameCompleted();
    }
  }, [dispatch, triggerGameCompleteConfetti, markGameCompleted, user, sessionId, saveGameToDatabase]);

  const initializeGame = useCallback(() => {
    const newSessionId = user ? `user_${user.id}_${Date.now()}` : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCells = BINGO_DATA.map((item, index) => ({
      id: index,
      term: item.term,
      definition: item.definition,
      selected: index === 24 // Free Space is pre-selected
    }));
    setCells(newCells);
    setCompletedLines([]);
    setRowsSolved(0);
    setScoreState(0);
    setGameComplete(false);
    setTimerState(0); // Always start timer at 0 for new games
    setGameStartTime(new Date().toISOString());
    setSessionId(newSessionId);
    // Use setTimeout to ensure cells are set before selecting definition
    setTimeout(() => {
      selectRandomDefinition(newCells);
    }, 0);
  }, [selectRandomDefinition, user]);

  // Restore state from Redux or Database on mount (only once)
  useEffect(() => {
    if (isInitialized) return; // Prevent re-initialization
    
    const initializeGameState = async () => {
      if (user) {
        // Try to load from database first
        const savedGame = await loadGameFromDatabase();
        if (savedGame) {
          // Restore from database
          const restoredCells = BINGO_DATA.map((item, index) => ({
            id: index,
            term: item.term,
            definition: item.definition,
            selected: savedGame.cells_selected.includes(index)
          }));
          setCells(restoredCells);
          setCompletedLines(savedGame.completed_lines || []);
          setRowsSolved(savedGame.rows_solved || 0);
          setScoreState(savedGame.score || 0);
          setTimerState(savedGame.total_time_seconds || 0);
          setGameStartTime(savedGame.game_start_time);
          setSessionId(savedGame.session_id || (user ? `user_${user.id}_${Date.now()}` : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`));
          setGameComplete(savedGame.is_completed || false);

          // Only set the current definition if it is still unanswered
          if (savedGame.current_definition) {
            // Check if the current definition is for a cell that is already selected
            const isAnswered = restoredCells.some(cell => cell.definition === savedGame.current_definition && cell.selected);
            if (!isAnswered) {
              setSelectedDefinitionState(savedGame.current_definition);
            } else {
              setTimeout(() => {
                selectRandomDefinition(restoredCells);
              }, 0);
            }
          } else {
            setTimeout(() => {
              selectRandomDefinition(restoredCells);
            }, 0);
          }

          console.log('Game restored from database');
        } else if (bingoRedux && bingoRedux.selectedCells && bingoRedux.selectedCells.length > 0) {
          // Restore from Redux
          const restoredCells = BINGO_DATA.map((item, index) => ({
            id: index,
            term: item.term,
            definition: item.definition,
            selected: bingoRedux.selectedCells.includes(index)
          }));
          setCells(restoredCells);
          setCompletedLines(bingoRedux.completedLinesState || []); 
          setRowsSolved(bingoRedux.rowsSolved || 0); 
          setScoreState(bingoRedux.score || 0);
          setGameComplete(false);
          setTimerState(bingoRedux.timer || 0);
          setGameStartTime(new Date().toISOString());
          setSessionId(generateSessionId());
          
          // Set the current definition or select a new one if none exists
          if (bingoRedux.selectedDefinition) {
            setSelectedDefinitionState(bingoRedux.selectedDefinition);
          } else {
            setTimeout(() => {
              selectRandomDefinition(restoredCells);
            }, 0);
          }
          
          console.log('Game restored from Redux');
        } else {
          initializeGame();
          console.log('New game initialized');
        }
      } else {
        initializeGame();
        console.log('New game initialized (no user)');
      }
      
      setIsInitialized(true);
    };

    initializeGameState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Only depend on user, not on the other values that change

  // Timer logic (controlled internally)
  useEffect(() => {
    // Pause timer if answer feedback or completed line modal is visible
    if (gameComplete || !timerActive || answerFeedback.isVisible || completedLineModal) return;
    const interval = setInterval(() => {
      setTimerState((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameComplete, timerActive, answerFeedback.isVisible, completedLineModal]);

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
    }));
  }, [timer, score, completedLines, cells, selectedDefinition, rowsSolved, dispatch, isInitialized]);

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
    
    // If the answer was correct, select next definition after modal closes
    if (answerFeedback.isCorrect) {
      setTimeout(() => {
        // Get the current updated cells state and select next definition
        setCells(currentCells => {
          selectRandomDefinition(currentCells);
          return currentCells; // Return the same state, we just needed the current value
        });
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
    // Mark current game as completed and update attempt history
    if (user && sessionId && gameComplete) {
      try {
        await saveGameToDatabase({
          is_completed: true,
          game_end_time: new Date().toISOString(),
          total_time_seconds: timer,
          score,
          rows_solved: rowsSolved,
          username: user.user_metadata?.full_name || user.email || 'Unknown User',
          module_number: 1,
          level_number: 1,
        }, { updateHistory: true });
      } catch (error) {
        console.warn('Error saving attempt history:', error);
      }
    }
    // Start a new game (new attempt)
    initializeGame();
    setScoreState(0); // Extra safety: ensure score is zeroed before user can interact
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
  };

  // Restart: Just reset state, do NOT update attempt history (for Navbar)
  const restartGame = () => {
    setAnswerFeedback({
      isVisible: false,
      isCorrect: false,
      selectedTerm: '',
      correctDefinition: ''
    });
    initializeGame();
    setScoreState(0); // Extra safety: ensure score is zeroed before user can interact
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
  };

  // Old resetGame for compatibility (calls restartGame)
  const resetGame = restartGame;
  // Helper: get sorted attempts for modal (highest score, then lowest time)
  // (moved to bottom of file for export)

  const isInCompletedLine = (cellId: number): boolean => {
    return completedLines.some(line => line.includes(cellId));
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
    restartGame, // for Navbar: just resets state, no history
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
  };
};