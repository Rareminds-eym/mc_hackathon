import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useDispatch, useSelector } from 'react-redux';
import { setTimer, setSelectedCells, setSelectedDefinition, saveState } from '../store/slices/bingoSlice';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

  // Generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Save game progress to Supabase
  const saveGameToDatabase = useCallback(async (gameData: Partial<Level1GameData>) => {
    if (!user) return;

    try {
      const dataToSave = {
        user_id: user.id,
        session_id: sessionId,
        total_time_seconds: timer,
        score,
        rows_solved: rowsSolved,
        cells_selected: cells.filter(cell => cell.selected).map(cell => cell.id),
        completed_lines: completedLines,
        board_state: [
          cells.map(cell => cell.selected ? 1 : 0).slice(0, 5),
          cells.map(cell => cell.selected ? 1 : 0).slice(5, 10),
          cells.map(cell => cell.selected ? 1 : 0).slice(10, 15),
          cells.map(cell => cell.selected ? 1 : 0).slice(15, 20),
          cells.map(cell => cell.selected ? 1 : 0).slice(20, 25),
        ],
        is_completed: gameComplete,
        current_definition: selectedDefinition,
        game_start_time: gameStartTime,
        ...gameData
      };

      const { data, error } = await supabase
        .from('level_1')
        .upsert(dataToSave, { 
          onConflict: 'user_id,session_id',
          ignoreDuplicates: false 
        })
        .select();

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
  }, [user, sessionId, timer, score, rowsSolved, cells, completedLines, gameComplete, selectedDefinition, gameStartTime]);

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

      return data && data.length > 0 ? data[0] : null;
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
  const markGameCompleted = useCallback(async () => {
    if (!user || !sessionId) return;

    try {
      const { error } = await supabase
        .from('level_1')
        .update({
          is_completed: true,
          game_end_time: new Date().toISOString(),
          total_time_seconds: timer,
          score,
          rows_solved: rowsSolved
        })
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) {
        console.warn('Database update failed (table might not exist):', error.message);
        // Don't throw error, just log it
      }
    } catch (error) {
      console.warn('Error in markGameCompleted (continuing without database):', error);
      // Game continues to work without database
    }
  }, [user, sessionId, timer, score, rowsSolved]);

  const selectRandomDefinition = useCallback((currentCells: BingoCell[]) => {
    const unselectedCells = currentCells.filter(cell => !cell.selected);
    if (unselectedCells.length > 0) {
      const randomCell = unselectedCells[Math.floor(Math.random() * unselectedCells.length)];
      setSelectedDefinitionState(randomCell.definition);
      dispatch(setSelectedDefinition(randomCell.definition));
    } else {
      // All cells are selected, game is complete
      setGameComplete(true);
      triggerGameCompleteConfetti();
      markGameCompleted();
    }
  }, [dispatch, triggerGameCompleteConfetti, markGameCompleted]);

  const initializeGame = useCallback(() => {
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
    setSessionId(generateSessionId());
    // Use setTimeout to ensure cells are set before selecting definition
    setTimeout(() => {
      selectRandomDefinition(newCells);
    }, 0);
  }, [selectRandomDefinition]);

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
          setSessionId(savedGame.session_id || generateSessionId());
          setGameComplete(savedGame.is_completed || false);
          
          // Set the current definition or select a new one if none exists
          if (savedGame.current_definition) {
            setSelectedDefinitionState(savedGame.current_definition);
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
          setCompletedLines([]); 
          setRowsSolved(0); 
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
    if (gameComplete || !timerActive) return;
    const interval = setInterval(() => {
      setTimerState((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameComplete, timerActive]);

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

  // Restore completedLines and rowsSolved from Redux
  useEffect(() => {
    if (bingoRedux && bingoRedux.completedLinesState && Array.isArray(bingoRedux.completedLinesState)) {
      setCompletedLines(bingoRedux.completedLinesState);
    }
    if (bingoRedux && typeof bingoRedux.rowsSolved === 'number') {
      setRowsSolved(bingoRedux.rowsSolved);
    }
  }, [bingoRedux]);

  const toggleCell = (id: number) => {
    if (gameComplete || answerFeedback.isVisible) return;
    
    const clickedCell = cells.find(cell => cell.id === id);
    if (!clickedCell || clickedCell.selected) return;

    // Show feedback modal
    const isCorrect = clickedCell.definition === selectedDefinition;
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
      
      // Save game progress to database
      saveGameToDatabase({});
      
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
      setCompletedLines(prev => [...prev, ...newCompletedLines]);
      setRowsSolved(prev => prev + newCompletedLines.length);
      setScoreState(prev => prev + newCompletedLines.length * 10);
      if (newLineTriggered) setCompletedLineModal(true);
      
      // Save game progress to database
      saveGameToDatabase({});
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

  const resetGame = async () => {
    setAnswerFeedback({
      isVisible: false,
      isCorrect: false,
      selectedTerm: '',
      correctDefinition: ''
    });
    
    // Mark current game as completed if there was one
    if (user && sessionId && !gameComplete) {
      await markGameCompleted();
    }
    
    initializeGame();
    // Optionally reset Redux state as well
    dispatch(saveState({
      timer: 0,
      score: 0,
      completedLines: 0,
      completedLinesState: [], // Reset completed lines
      rowsSolved: 0, // Reset rowsSolved
      boardState: [],
      selectedCells: [],
      selectedDefinition: '',
    }));
  };

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
    resetGame,
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