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
  const [isSaving, setIsSaving] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
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
  const [showGameCompleteModal, setShowGameCompleteModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const dispatch = useDispatch();
  const bingoRedux = useSelector((state: { bingo: BingoState }) => state.bingo);

  const generateSessionId = () => {
    return user ? `user_${user.id}_${Date.now()}` : `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

// Updated updateAttemptHistory: only store real attempts, pad with 0s/nulls at the start if < 3
const updateAttemptHistory = async (score: number, timer: number) => {
  if (!user) return { score_history: [], timer_history: [] };
  try {
    const { data: existing, error } = await supabase
      .from('level_1')
      .select('score_history, timer_history')
      .eq('user_id', user.id)
      .eq('module_number', 1)
      .eq('level_number', 1)
      .order('game_start_time', { ascending: false })
      .limit(1);
    if (error) throw error;
    let score_history = existing?.[0]?.score_history || [];
    let timer_history = existing?.[0]?.timer_history || [];
    if (!Array.isArray(score_history)) score_history = [];
    if (!Array.isArray(timer_history)) timer_history = [];
    // Remove any 0/0 or null/null pairs from the start (initial state)
    while (score_history.length && (score_history[0] === 0 || score_history[0] == null) && (timer_history[0] === 0 || timer_history[0] == null)) {
      score_history.shift();
      timer_history.shift();
    }
    // Only add if score > 0 and timer > 0
    if (score > 0 && timer > 0) {
      score_history.push(score);
      timer_history.push(timer);
    }
    // Only keep last 3
    while (score_history.length > 3) score_history.shift();
    while (timer_history.length > 3) timer_history.shift();
    // Pad with 0s at the start if less than 3
    while (score_history.length < 3) score_history.unshift(0);
    while (timer_history.length < 3) timer_history.unshift(0);
    return { score_history, timer_history };
  } catch (error) {
    console.error('Error updating attempt history:', error);
    return { score_history: [], timer_history: [] };
  }
};

  // Updated saveGameToDatabase function
const saveGameToDatabase = useCallback(async (gameData: Partial<Level1GameData>, opts?: { updateHistory?: boolean; resetHistory?: boolean }) => {
  if (!user) return;
  setIsSaving(true);
  
  try {
    let score_history: number[] = [];
    let timer_history: number[] = [];
    
    if (opts?.resetHistory) {
      // Clear history for new games
      score_history = [];
      timer_history = [];
    } else if (opts?.updateHistory) {
      // Update history for completed games
      const result = await updateAttemptHistory(gameData.score ?? score, gameData.total_time_seconds ?? timer);
      score_history = result.score_history;
      timer_history = result.timer_history;
    }

    const dataToSave = {
      ...gameData,
      user_id: user.id,
      username: user.user_metadata?.full_name || user.email || 'Unknown User',
      session_id: sessionId,
      total_time_seconds: gameData.total_time_seconds ?? timer,
      score: gameData.score ?? score,
      rows_solved: gameData.rows_solved ?? rowsSolved,
      cells_selected: gameData.cells_selected ?? cells.filter(cell => cell.selected).map(cell => cell.id),
      completed_lines: gameData.completed_lines ?? completedLines,
      board_state: gameData.board_state ?? [
        cells.map(cell => cell.selected ? 1 : 0).slice(0, 5),
        cells.map(cell => cell.selected ? 1 : 0).slice(5, 10),
        cells.map(cell => cell.selected ? 1 : 0).slice(10, 15),
        cells.map(cell => cell.selected ? 1 : 0).slice(15, 20),
        cells.map(cell => cell.selected ? 1 : 0).slice(20, 25),
      ],
      is_completed: gameData.is_completed ?? gameComplete,
      current_definition: gameData.current_definition ?? selectedDefinition,
      game_start_time: gameData.game_start_time ?? gameStartTime,
      module_number: 1,
      level_number: 1,
      ...(opts?.resetHistory || opts?.updateHistory ? { 
        score_history,
        timer_history 
      } : {}),
    };

      // Use upsert to either update existing record or create new one
    const { data, error } = await supabase
      .from('level_1')
      .upsert(dataToSave)
      .eq('user_id', user.id)
      .eq('module_number', 1)
      .eq('level_number', 1)
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  } finally {
    setIsSaving(false);
  }
}, [user, sessionId, timer, score, rowsSolved, cells, completedLines, gameComplete, selectedDefinition, gameStartTime]);

// Updated playAgain function
const playAgain = async () => {
  try {
    // Save completed game first
    if (user && sessionId) {
      await saveGameToDatabase({
        is_completed: true,
        game_end_time: new Date().toISOString(),
        total_time_seconds: timer,
        score: score,
        rows_solved: rowsSolved,
      }, { updateHistory: true });
    }

    // Reset UI state
    setAnswerFeedback({
      isVisible: false,
      isCorrect: false,
      selectedTerm: '',
      correctDefinition: ''
    });
    setShowGameCompleteModal(false);
    setCountdown(3);

    // Start countdown
    let countdownValue = 3;
    const countdownInterval = setInterval(() => {
      countdownValue -= 1;
      setCountdown(countdownValue);
      
      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        
        // Initialize new game with fresh history
        const newSessionId = generateSessionId();
        const newCells = BINGO_DATA.map((item, index) => ({
          id: index,
          term: item.term,
          definition: item.definition,
          selected: index === 24
        }));
        
        setCells(newCells);
        setCompletedLines([]);
        setRowsSolved(0);
        setScoreState(0);
        setGameComplete(false);
        setTimerState(0);
        setGameStartTime(new Date().toISOString());
        setSessionId(newSessionId);
        setSelectedDefinitionState('');

        // Save new game with reset history
        if (user) {
          saveGameToDatabase({
            is_completed: false,
            is_restarted: false,
            total_time_seconds: 0,
            score: 0,
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
            current_definition: '',
            session_id: newSessionId,
            game_start_time: new Date().toISOString()
          }, { resetHistory: true });
        }

        // Select first definition
        setTimeout(() => {
          selectRandomDefinition(newCells);
        }, 0);
      }
    }, 1000);
  } catch (error) {
    console.error('Error in playAgain:', error);
  }
};

const triggerGameCompleteConfetti = useCallback(() => {
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

  const markGameCompleted = useCallback(async (finalScore?: number, finalTimer?: number, finalRowsSolved?: number) => {
    if (!user) return;
    if (window.__bingoGameCompletedSession === sessionId) return;
    window.__bingoGameCompletedSession = sessionId;
    // Persist modal state in localStorage for resume
    try {
      localStorage.setItem('bingo_showGameCompleteModal', 'true');
    } catch {}
    setShowGameCompleteModal(true);
    try {
      await saveGameToDatabase({
        is_completed: true,
        game_end_time: new Date().toISOString(),
        total_time_seconds: typeof finalTimer === 'number' ? finalTimer : timer,
        score: typeof finalScore === 'number' ? finalScore : score,
        rows_solved: typeof finalRowsSolved === 'number' ? finalRowsSolved : rowsSolved,
        username: user.user_metadata?.full_name || user.email || 'Unknown User',
        module_number: 1,
        level_number: 1,
      }, { updateHistory: true });
    } catch (error) {
      console.warn('Error in markGameCompleted:', error);
    }
  }, [user, timer, score, rowsSolved, saveGameToDatabase, sessionId]);

  const selectRandomDefinition = useCallback((currentCells: BingoCell[]) => {
    const unselectedCells = currentCells.filter(cell => !cell.selected);
    if (unselectedCells.length > 0) {
      const randomCell = unselectedCells[Math.floor(Math.random() * unselectedCells.length)];
      setSelectedDefinitionState(randomCell.definition);
      dispatch(setSelectedDefinition(randomCell.definition));
      
      if (user && sessionId) {
        saveGameToDatabase({
          current_definition: randomCell.definition
        });
      }
    } else {
      setGameComplete(true);
      triggerGameCompleteConfetti();
      markGameCompleted(score, timer, rowsSolved);
    }
  }, [dispatch, triggerGameCompleteConfetti, markGameCompleted, user, sessionId, saveGameToDatabase, score, timer, rowsSolved]);

  const initializeGame = useCallback(() => {
    const newSessionId = generateSessionId();
    const newCells = BINGO_DATA.map((item, index) => ({
      id: index,
      term: item.term,
      definition: item.definition,
      selected: index === 24
    }));
    
    setCells(newCells);
    setCompletedLines([]);
    setRowsSolved(0);
    setScoreState(0);
    setGameComplete(false);
    setTimerState(0);
    setGameStartTime(new Date().toISOString());
    setSessionId(newSessionId);
    setSelectedDefinitionState('');

    if (user) {
      saveGameToDatabase({
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
        current_definition: '',
        module_number: 1,
        level_number: 1,
        session_id: newSessionId,
        game_start_time: new Date().toISOString(),
        score_history: [],
        timer_history: [],
      }, { resetHistory: true });
    }

    setTimeout(() => {
      selectRandomDefinition(newCells);
    }, 0);
  }, [selectRandomDefinition, user, saveGameToDatabase]);

  useEffect(() => {
    if (isInitialized) return;
    setIsResuming(true);
    const initializeGameState = async () => {
      let shouldShowModal = false;
      try {
        shouldShowModal = localStorage.getItem('bingo_showGameCompleteModal') === 'true';
      } catch {}
      if (user) {
        const savedGame = await loadGameFromDatabase();
        if (savedGame) {
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
          setGameComplete(!!savedGame.is_completed);
          if (savedGame.is_completed && shouldShowModal) {
            setShowGameCompleteModal(true);
            setSelectedDefinitionState('');
          } else if (savedGame.current_definition) {
            const isAnswered = restoredCells.some(cell => 
              cell.definition === savedGame.current_definition && cell.selected
            );
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
        } else if (bingoRedux?.selectedCells?.length > 0) {
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
          if (bingoRedux.selectedDefinition) {
            setSelectedDefinitionState(bingoRedux.selectedDefinition);
          } else {
            setTimeout(() => {
              selectRandomDefinition(restoredCells);
            }, 0);
          }
        } else {
          initializeGame();
        }
      } else {
        initializeGame();
      }
      setIsInitialized(true);
      setIsResuming(false);
    };
    initializeGameState();
  }, [user, bingoRedux, initializeGame, loadGameFromDatabase, selectRandomDefinition]);

  useEffect(() => {
    if (gameComplete || !timerActive || answerFeedback.isVisible || completedLineModal) return;
    const interval = setInterval(() => {
      setTimerState((prev: number) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameComplete, timerActive, answerFeedback.isVisible, completedLineModal]);

  const startTimer = useCallback(() => setTimerActive(true), []);
  const stopTimer = useCallback(() => setTimerActive(false), []);

  useEffect(() => {
    dispatch(setTimer(timer));
  }, [timer, dispatch]);

  useEffect(() => {
    if (!isInitialized) return;
    
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
  }, [timer, score, completedLines, cells, selectedDefinition, rowsSolved, dispatch, isInitialized]);

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

    const normalizeString = (str: string) => str.trim().replace(/\s+/g, ' ');
    const cellDefNormalized = normalizeString(clickedCell.definition);
    const selectedDefNormalized = normalizeString(selectedDefinition);
    
    const isCorrect = cellDefNormalized === selectedDefNormalized;
    
    setAnswerFeedback({
      isVisible: true,
      isCorrect,
      selectedTerm: clickedCell.term,
      correctDefinition: selectedDefinition
    });

    if (isCorrect) {
      const newCells = cells.map(cell =>
        cell.id === id ? { ...cell, selected: true } : cell
      );
      setCells(newCells);
      dispatch(setSelectedCells(newCells.filter(cell => cell.selected).map(cell => cell.id)));
      
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
      
      setTimeout(() => {
        checkForNewLines(newCells);
      }, 100);
    }
  };

  const closeAnswerModal = () => {
    setAnswerFeedback(prev => ({ ...prev, isVisible: false }));
    
    if (answerFeedback.isCorrect) {
      setTimeout(() => {
        setCells(currentCells => {
          selectRandomDefinition(currentCells);
          return currentCells;
        });
      }, 300);
    }
  };

  const checkForNewLines = (currentCells: BingoCell[]) => {
    const patterns = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], 
      [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], 
      [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];

    const newCompletedLines: number[][] = [];
    let newLineTriggered = false;
    
    for (const pattern of patterns) {
      const isComplete = pattern.every(index => currentCells[index].selected);
      if (isComplete) {
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

      if (newCompletedLinesState.length >= patterns.length) {
        setGameComplete(true);
        markGameCompleted();
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

  const playAgain = async () => {
    setAnswerFeedback({
      isVisible: false,
      isCorrect: false,
      selectedTerm: '',
      correctDefinition: ''
    });
    setShowGameCompleteModal(false);
    // Only clear the modal flag on explicit user action
    try {
      localStorage.removeItem('bingo_showGameCompleteModal');
    } catch (e) { /* ignore */ }

    if (user && sessionId) {
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
        module_number: 1,
        level_number: 1,
      }, { updateHistory: true });
    }

    setScoreState(0);
    setTimerState(0);
    setCountdown(3);
    let countdownValue = 3;
    const countdownInterval = setInterval(() => {
      countdownValue -= 1;
      setCountdown(countdownValue);
      if (countdownValue <= 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        initializeGame();
      }
    }, 1000);
  };

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
    playAgain,
    closeAnswerModal,
    closeCompletedLineModal,
    isInCompletedLine,
    timer,
    setTimer: setTimerState,
    startTimer,
    stopTimer,
    timerActive,
    isSaving,
    isRestarting,
    isResuming,
    showGameCompleteModal,
    setShowGameCompleteModal: (val: boolean) => {
      setShowGameCompleteModal(val);
      // Only clear the modal flag on explicit user action (close/dismiss)
      if (!val) {
        try { localStorage.removeItem('bingo_showGameCompleteModal'); } catch (e) { /* ignore */ }
      }
    },
    countdown,
  };
};