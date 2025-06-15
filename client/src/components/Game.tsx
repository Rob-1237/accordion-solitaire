import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from './Card';

import { generateDeck, shuffleDeck } from '../utils/deckUtils';
import { isValidMove, hasNoMoreMoves, findHintMove } from '../utils/gameLogic';
import type { CardType, HintMove } from '../types/card';

import { saveGame, loadGame } from '../services/firebaseService';

// Custom hook for authentication
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const hasShownWelcome = useRef(false);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      // Only show welcome message if component is mounted and we haven't shown it yet
      if (user && isMounted.current && !hasShownWelcome.current) {
        hasShownWelcome.current = true;
        // Use setTimeout to ensure this happens after the current render cycle
        setTimeout(() => {
          if (isMounted.current) {
            toast.success(`Welcome back, ${user.email}!`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }
        }, 100);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      if (isMounted.current) {
        toast.info('Logged out successfully', {
          position: "top-right",
          autoClose: 3000,
        });
      }
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      if (isMounted.current) {
        toast.error('Failed to log out. Please try again.');
      }
    }
  }, [navigate]);

  return { currentUser, handleLogout };
};

// Custom hook for game state management
const useGameState = (currentUser: User | null) => {
  const [boardCards, setBoardCards] = useState<CardType[]>([]);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [moveHistory, setMoveHistory] = useState<CardType[][]>([]);
  const [isLoadingGame, setIsLoadingGame] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const isMounted = useRef(false);
  const loadingToastId = useRef<string | number | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Clear any pending toasts on unmount
      if (loadingToastId.current) {
        toast.dismiss(loadingToastId.current);
      }
    };
  }, []);

  // Memoize game state
  const gameState = useMemo(() => ({
    boardCards,
    hasWon,
    hasLost,
    moveHistory,
  }), [boardCards, hasWon, hasLost, moveHistory]);

  // Initialize or load game
  useEffect(() => {
    const initializeOrLoadGame = async () => {
      if (!isMounted.current) return;
      
      setIsLoadingGame(true);
      try {
        if (currentUser) {
          loadingToastId.current = toast.loading('Loading your game...', {
            position: "top-right",
          });
          
          const loadedData = await loadGame(currentUser.uid);
          if (!isMounted.current) return;

          if (loadedData) {
            setBoardCards(loadedData.boardCards);
            setHasWon(loadedData.hasWon);
            setHasLost(loadedData.hasLost);
            setMoveHistory(loadedData.moveHistory);
            toast.update(loadingToastId.current, { 
              render: 'Game loaded successfully!', 
              type: 'success', 
              isLoading: false,
              autoClose: 3000
            });
          } else {
            const shuffled = shuffleDeck(generateDeck());
            setBoardCards(shuffled);
            setHasWon(false);
            setHasLost(false);
            setMoveHistory([]);
            setIsSaving(true);
            await saveGame(currentUser.uid, { 
              boardCards: shuffled, 
              hasWon: false, 
              hasLost: false, 
              moveHistory: [] 
            });
            if (!isMounted.current) return;
            setIsSaving(false);
            toast.update(loadingToastId.current, { 
              render: 'New game started!', 
              type: 'success', 
              isLoading: false,
              autoClose: 3000
            });
          }
        } else {
          const shuffled = shuffleDeck(generateDeck());
          setBoardCards(shuffled);
          setHasWon(false);
          setHasLost(false);
          setMoveHistory([]);
        }
      } catch (error) {
        console.error("Error loading or saving initial game:", error);
        if (isMounted.current) {
          toast.error('Failed to load game. Starting a new game instead.');
        }
        const shuffled = shuffleDeck(generateDeck());
        setBoardCards(shuffled);
        setHasWon(false);
        setHasLost(false);
        setMoveHistory([]);
      }
      if (isMounted.current) {
        setIsLoadingGame(false);
      }
    };

    if (currentUser !== undefined) {
      initializeOrLoadGame();
    }
  }, [currentUser]);

  const saveGameState = useCallback(async (state: typeof gameState) => {
    if (!currentUser || !isMounted.current) return;
    
    setIsSaving(true);
    const toastId = toast.loading('Saving game...', {
      position: "top-right",
    });
    try {
      await saveGame(currentUser.uid, state);
      if (isMounted.current) {
        toast.update(toastId, { 
          render: 'Game saved!', 
          type: 'success', 
          isLoading: false,
          autoClose: 3000
        });
      }
    } catch (error) {
      console.error('Error saving game:', error);
      if (isMounted.current) {
        toast.update(toastId, { 
          render: 'Failed to save game. Your progress may not be saved.', 
          type: 'error', 
          isLoading: false,
          autoClose: 5000
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  }, [currentUser]);

  const handleRestart = useCallback(() => {
    const newDeck = shuffleDeck(generateDeck());
    setBoardCards(newDeck);
    setHasWon(false);
    setHasLost(false);
    setMoveHistory([]);

    if (currentUser) {
      saveGameState({ 
        boardCards: newDeck, 
        hasWon: false, 
        hasLost: false, 
        moveHistory: [] 
      });
    }
  }, [currentUser, saveGameState]);

  const handleUndo = useCallback(() => {
    if (moveHistory.length > 0) {
      const previousBoard = moveHistory[moveHistory.length - 1];
      const updatedMoveHistory = moveHistory.slice(0, moveHistory.length - 1);

      setBoardCards(previousBoard);
      setMoveHistory(updatedMoveHistory);
      setHasWon(false);
      setHasLost(false);

      if (currentUser) {
        saveGameState({ 
          boardCards: previousBoard, 
          hasWon: false, 
          hasLost: false, 
          moveHistory: updatedMoveHistory 
        });
      } else {
        setMoveHistory(prevHistory => [...prevHistory, previousBoard]);
      }
    }
  }, [moveHistory, currentUser, saveGameState]);

  const handleCardDrop = useCallback((draggedCardId: string, targetCardId: string) => {
    setBoardCards(prevCards => {
      const draggedIndex = prevCards.findIndex(card => card.id === draggedCardId);
      const targetIndex = prevCards.findIndex(card => card.id === targetCardId);

      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        toast.error('Invalid move: Cannot drop card on itself');
        return prevCards;
      }

      const draggedCard = prevCards[draggedIndex];
      const targetCard = prevCards[targetIndex];

      if (!isValidMove(draggedCard, targetCard, draggedIndex, targetIndex)) {
        toast.error('Invalid move: Cards must match in suit or rank');
        return prevCards;
      }

      const currentBoardForHistory = [...prevCards];
      const newCards = [...prevCards];
      const [cardToMove] = newCards.splice(draggedIndex, 1);
      const effectiveTargetIndex = (draggedIndex < targetIndex) ? targetIndex - 1 : targetIndex;
      newCards.splice(effectiveTargetIndex, 1, cardToMove);

      const newHasWon = newCards.length === 1;
      const newHasLost = newHasWon ? false : hasNoMoreMoves(newCards);

      setHasWon(newHasWon);
      setHasLost(newHasLost);

      if (currentUser) {
        const updatedMoveHistoryAfterDrop = [...moveHistory, currentBoardForHistory];
        setMoveHistory(updatedMoveHistoryAfterDrop);
        saveGameState({
          boardCards: newCards,
          hasWon: newHasWon,
          hasLost: newHasLost,
          moveHistory: updatedMoveHistoryAfterDrop,
        });
      } else {
        setMoveHistory(prevHistory => [...prevHistory, currentBoardForHistory]);
      }

      return newCards;
    });
  }, [currentUser, moveHistory, saveGameState]);

  return {
    gameState,
    isLoadingGame,
    isSaving,
    handleRestart,
    handleUndo,
    handleCardDrop,
  };
};

// Custom hook for hint management
const useHint = (boardCards: CardType[], hasWon: boolean, hasLost: boolean) => {
  const [hint, setHint] = useState<HintMove | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    if (hasWon || hasLost) {
      setHint(null);
    } else {
      setHint(findHintMove(boardCards));
    }
  }, [boardCards, hasWon, hasLost]);

  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  return { hint, showHint, setShowHint };
};

// Sub-component for game controls
const GameControls = React.memo(({ 
  onRestart, 
  onUndo, 
  onHint, 
  hint, 
  hasWon, 
  hasLost, 
  moveHistory, 
  showHint,
  isSaving
}: {
  onRestart: () => void;
  onUndo: () => void;
  onHint: () => void;
  hint: HintMove | null;
  hasWon: boolean;
  hasLost: boolean;
  moveHistory: CardType[][];
  showHint: boolean;
  isSaving: boolean;
}) => (
  <div className="flex flex-col xs:flex-row gap-2xs md:gap-xs items-center">
    <button
      onClick={onHint}
      disabled={hint === null || hasWon || hasLost}
      className={`min-h-touch-min px-touch-md py-2xs rounded-md font-bold transition-colors duration-200 ${
        hint === null || hasWon || hasLost
          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
          : showHint
            ? 'bg-purple-700 text-white'
            : 'bg-purple-500 hover:bg-purple-700 text-white'
      }`}
    >
      <span className="text-responsive-sm md:text-responsive-base">
        {showHint ? 'Hint Active' : 'Hint'}
      </span>
    </button>

    <button
      onClick={onUndo}
      disabled={moveHistory.length === 0 || hasWon || hasLost}
      className={`min-h-touch-min px-touch-md py-2xs rounded-md font-bold transition-colors duration-200 ${
        moveHistory.length === 0 || hasWon || hasLost
          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
          : 'bg-yellow-500 hover:bg-yellow-700 text-white'
      }`}
    >
      <span className="text-responsive-sm md:text-responsive-base">Undo</span>
    </button>

    <button
      onClick={onRestart}
      className="min-h-touch-min px-touch-md py-2xs rounded-md font-bold bg-blue-500 hover:bg-blue-700 text-white transition-colors duration-200"
    >
      <span className="text-responsive-sm md:text-responsive-base">Restart Game</span>
    </button>
  </div>
));

GameControls.displayName = 'GameControls';

// Sub-component for game overlays
const GameOverlay = React.memo(({ 
  hasWon, 
  hasLost, 
  onRestart 
}: { 
  hasWon: boolean; 
  hasLost: boolean; 
  onRestart: () => void; 
}) => {
  if (!hasWon && !hasLost) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-overlay animate-responsive-fade">
      <div className={`${
        hasWon ? 'bg-yellow-300 text-green-900' : 'bg-red-300 text-red-900'
      } p-4xs md:p-2xs lg:p-xs rounded-lg shadow-xl text-center max-w-[90vw] md:max-w-[80vw] lg:max-w-[600px] animate-responsive-scale`}>
        <h2 className="text-responsive-xl md:text-responsive-2xl font-bold mb-2xs md:mb-xs">
          {hasWon ? '🎉 Congratulations! You Win! 🎉' : 'Game Over! 😥'}
        </h2>
        <p className="text-responsive-base md:text-responsive-lg mb-2xs md:mb-xs">
          {hasWon ? "You've successfully consolidated all cards!" : 'No more valid moves left.'}
        </p>
        <button
          onClick={onRestart}
          className={`min-h-touch-md px-touch-lg py-2xs md:py-xs rounded-lg font-bold text-responsive-base md:text-responsive-lg transition-colors duration-200 ${
            hasWon 
              ? 'bg-green-600 hover:bg-green-800' 
              : 'bg-blue-600 hover:bg-blue-800'
          } text-white`}
        >
          {hasWon ? 'Play Again!' : 'Try Again!'}
        </button>
      </div>
    </div>
  );
});

GameOverlay.displayName = 'GameOverlay';

// Main Game component
const Game: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, handleLogout } = useAuth();
  const { 
    gameState: { boardCards, hasWon, hasLost, moveHistory },
    isLoadingGame,
    isSaving,
    handleRestart,
    handleUndo,
    handleCardDrop,
  } = useGameState(currentUser);
  const { hint, showHint, setShowHint } = useHint(boardCards, hasWon, hasLost);
  const [invalidMoveCards, setInvalidMoveCards] = useState<{ draggedId: string | null, targetId: string | null }>({
    draggedId: null,
    targetId: null
  });

  useEffect(() => {
    if (invalidMoveCards.draggedId || invalidMoveCards.targetId) {
      const timer = setTimeout(() => {
        setInvalidMoveCards({ draggedId: null, targetId: null });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [invalidMoveCards]);

  // Memoize the card rendering
  const renderedCards = useMemo(() => (
    boardCards.map(card => (
      <Card
        key={card.id}
        id={card.id}
        rank={card.rank}
        suit={card.suit}
        onDropCard={handleCardDrop}
        gameEnded={hasWon || hasLost}
        isHintDragged={showHint && hint?.draggedCardId === card.id}
        isHintTarget={showHint && hint?.targetCardId === card.id}
        isInvalidDragged={invalidMoveCards.draggedId === card.id}
        isInvalidTarget={invalidMoveCards.targetId === card.id}
      />
    ))
  ), [boardCards, handleCardDrop, hasWon, hasLost, showHint, hint, invalidMoveCards]);

  if (isLoadingGame) {
    return (
      <div className="min-h-screen bg-green-700 p-2xs md:p-xs flex items-center justify-center">
        <div className="flex flex-col items-center gap-2xs md:gap-xs animate-responsive-fade">
          <div className="w-3xl h-3xl border-4 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-responsive-lg md:text-responsive-xl font-bold text-white">
            Loading game...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-700 p-2xs md:p-xs lg:p-sm">
      <GameOverlay hasWon={hasWon} hasLost={hasLost} onRestart={handleRestart} />

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2xs md:gap-xs mb-2xs md:mb-xs">
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2xs">
            <h1 className="text-responsive-xl md:text-responsive-2xl font-bold text-white">
              Accordion Solitaire
            </h1>
            {currentUser && (
              <div className="flex items-center gap-2xs text-white">
                <div className="w-2xs h-2xs bg-green-400 rounded-full animate-pulse" />
                <span className="text-responsive-sm md:text-responsive-base">
                  Logged in as {currentUser.email}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2xs w-full xs:w-auto">
            <GameControls
              onRestart={handleRestart}
              onUndo={handleUndo}
              onHint={() => setShowHint(prev => !prev)}
              hint={hint}
              hasWon={hasWon}
              hasLost={hasLost}
              moveHistory={moveHistory}
              showHint={showHint}
              isSaving={isSaving}
            />

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="min-h-touch-min px-touch-md py-2xs rounded-md font-bold bg-red-500 hover:bg-red-700 text-white transition-colors duration-200 text-responsive-sm md:text-responsive-base"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="min-h-touch-min px-touch-md py-2xs rounded-md font-bold bg-green-500 hover:bg-green-700 text-white transition-colors duration-200 text-responsive-sm md:text-responsive-base"
              >
                Login / Save Game
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2xs md:gap-xs justify-center">
          {renderedCards}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Game);