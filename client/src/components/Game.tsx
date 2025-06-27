import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdLightbulb, MdUndo, MdRestartAlt, MdEdit, MdLogout, MdLogin, MdInfo } from 'react-icons/md';

import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { saveGame, loadGame } from '../services/firebaseService';

import { generateDeck, shuffleDeck } from '../utils/deckUtils';
import { isValidMove, hasNoMoreMoves, findHintMove } from '../utils/gameLogic';
import type { CardType, HintMove } from '../types/card';
import AccountEditModal from './AccountEditModal';
import Card from './Card';
import { OverlayContext } from '../App';

const Game: React.FC = () => {
    const navigate = useNavigate();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [showRotate, setShowRotate] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const { setShowOverlay } = useContext(OverlayContext);

    useLayoutEffect(() => {
        const checkOrientation = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            setShowRotate(w < 540 && w < h);
        };
        window.addEventListener('resize', checkOrientation);
        checkOrientation();
        return () => window.removeEventListener('resize', checkOrientation);
    }, []);

    const displayGameMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
        switch (type) {
            case 'success':
                toast.success(text, { autoClose: duration });
                break;
            case 'error':
                toast.error(text, { autoClose: duration });
                break;
            case 'info':
            default:
                toast.info(text, { autoClose: duration });
                break;
        }
    }, []);

    // Custom hook for authentication
    const useAuth = (displayGameMessage: (text: string, type?: 'success' | 'error' | 'info', duration?: number) => void) => {
        const [currentUser, setCurrentUser] = useState<User | null>(null);

        useEffect(() => {
            const unsubscribe = auth.onAuthStateChanged(user => {
                setCurrentUser(user);
            });
            return () => unsubscribe();
        }, []);

        const handleLogout = useCallback(async () => {
            try {
                await signOut(auth);
                displayGameMessage('Logged out successfully!', 'info');
                setShowOverlay(true);
                // navigate('/');
            } catch (error: any) {
                console.error('Error logging out:', error);
                displayGameMessage(`Error logging out: ${error.message}`, 'error');
            }
        }, [navigate, displayGameMessage, setShowOverlay]);

        return { currentUser, handleLogout };
    };

    // Custom hook for game state management
    const useGameState = (
        currentUser: User | null,
        displayGameMessage: (text: string, type?: 'success' | 'error' | 'info', duration?: number) => void
    ) => {
        const [boardCards, setBoardCards] = useState<CardType[]>([]);
        const [hasWon, setHasWon] = useState<boolean>(false);
        const [hasLost, setHasLost] = useState<boolean>(false);
        const [moveHistory, setMoveHistory] = useState<CardType[][]>([]);
        const [isLoadingGame, setIsLoadingGame] = useState<boolean>(true);
        const [isSavingGame, setIsSavingGame] = useState<boolean>(false);
        const [invalidMoveCardsState, setInvalidMoveCardsState] = useState<{ draggedId: string | null, targetId: string | null }>({
            draggedId: null,
            targetId: null
        });

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
                setIsLoadingGame(true);
                try {
                    if (currentUser) {
                        const loadedData = await loadGame(currentUser.uid);
                        if (loadedData) {
                            setBoardCards(loadedData.boardCards);
                            setHasWon(loadedData.hasWon);
                            setHasLost(loadedData.hasLost);
                            setMoveHistory(loadedData.moveHistory);
                            displayGameMessage('Game loaded successfully!', 'success');
                        } else {
                            const shuffled = shuffleDeck(generateDeck());
                            setBoardCards(shuffled);
                            setHasWon(false);
                            setHasLost(false);
                            setMoveHistory([]);
                            displayGameMessage('No saved game found. Starting a new game.', 'info');

                            setIsSavingGame(true);
                            try {
                                await saveGame(currentUser.uid, {
                                    boardCards: shuffled,
                                    hasWon: false,
                                    hasLost: false,
                                    moveHistory: []
                                });
                            } catch (saveError: any) {
                                console.error("Error saving initial game:", saveError);
                                displayGameMessage(`Error saving initial game: ${saveError.message}`, 'error');
                            } finally {
                                setIsSavingGame(false);
                            }
                        }
                    } else {
                        const shuffled = shuffleDeck(generateDeck());
                        setBoardCards(shuffled);
                        setHasWon(false);
                        setHasLost(false);
                        setMoveHistory([]);
                    }
                } catch (error: any) {
                    console.error("Error loading or saving initial game:", error);
                    displayGameMessage(`Error loading game: ${error.message}. Starting a new game.`, 'error');
                    const shuffled = shuffleDeck(generateDeck());
                    setBoardCards(shuffled);
                    setHasWon(false);
                    setHasLost(false);
                    setMoveHistory([]);
                }
                setIsLoadingGame(false);
            };

            if (currentUser !== undefined) {
                initializeOrLoadGame();
            }
        }, [currentUser, displayGameMessage]);

        // Effect for clearing invalid move visual feedback
        useEffect(() => {
            if (invalidMoveCardsState.draggedId || invalidMoveCardsState.targetId) {
                const timer = setTimeout(() => {
                    setInvalidMoveCardsState({ draggedId: null, targetId: null }); // Clear visual highlight
                }, 1500);
                return () => clearTimeout(timer);
            }
        }, [invalidMoveCardsState]);


        const handleRestart = useCallback(async () => {
            const newDeck = shuffleDeck(generateDeck());
            setBoardCards(newDeck);
            setHasWon(false);
            setHasLost(false);
            setMoveHistory([]);
            setInvalidMoveCardsState({ draggedId: null, targetId: null });

            if (currentUser) {
                setIsSavingGame(true);
                try {
                    await saveGame(currentUser.uid, {
                        boardCards: newDeck,
                        hasWon: false,
                        hasLost: false,
                        moveHistory: []
                    });
                    displayGameMessage('Game restarted and saved!', 'success');
                } catch (error: any) {
                    console.error("Error saving restarted game:", error);
                    displayGameMessage(`Error saving restarted game: ${error.message}`, 'error');
                } finally {
                    setIsSavingGame(false);
                }
            } else {
                displayGameMessage('Game restarted (not saved as anonymous).', 'info');
            }
        }, [currentUser, displayGameMessage]);

        const handleUndo = useCallback(async () => {
            if (moveHistory.length > 0) {
                const previousBoard = moveHistory[moveHistory.length - 1];
                const updatedMoveHistory = moveHistory.slice(0, moveHistory.length - 1);

                setBoardCards(previousBoard);
                setMoveHistory(updatedMoveHistory);
                setHasWon(false);
                setHasLost(false);
                setInvalidMoveCardsState({ draggedId: null, targetId: null });


                if (currentUser) {
                    setIsSavingGame(true);
                    try {
                        await saveGame(currentUser.uid, {
                            boardCards: previousBoard,
                            hasWon: false,
                            hasLost: false,
                            moveHistory: updatedMoveHistory
                        });
                        displayGameMessage('Move undone and saved!', 'success');
                    } catch (error: any) {
                        console.error("Error saving after undo:", error);
                        displayGameMessage(`Error saving after undo: ${error.message}`, 'error');
                    } finally {
                        setIsSavingGame(false);
                    }
                } else {
                    displayGameMessage('Move undone (not saved as anonymous).', 'info');
                }
            } else {
                displayGameMessage('No more moves to undo!', 'info');
            }
        }, [moveHistory, currentUser, displayGameMessage]);

        const handleCardDrop = useCallback((draggedCardId: string, targetCardId: string) => {
            setBoardCards(prevCards => {
                const draggedIndex = prevCards.findIndex(card => card.id === draggedCardId);
                const targetIndex = prevCards.findIndex(card => card.id === targetCardId);

                // Check for invalid drop (e.g., card not found, dropping on self)
                if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
                    setInvalidMoveCardsState({ draggedId: draggedCardId, targetId: targetCardId });
                    return prevCards;
                }

                const draggedCard = prevCards[draggedIndex];
                const targetCard = prevCards[targetIndex];

                // Check game logic for valid move
                if (!isValidMove(draggedCard, targetCard, draggedIndex, targetIndex)) {
                    setInvalidMoveCardsState({ draggedId: draggedCardId, targetId: targetCardId });
                    return prevCards;
                }

                // If move is valid, clear any previous invalid move indicators
                setInvalidMoveCardsState({ draggedId: null, targetId: null });

                const currentBoardForHistory = [...prevCards];
                const newCards = [...prevCards];
                const [cardToMove] = newCards.splice(draggedIndex, 1);
                const effectiveTargetIndex = (draggedIndex < targetIndex) ? targetIndex - 1 : targetIndex;
                newCards.splice(effectiveTargetIndex, 1, cardToMove);

                const newHasWon = newCards.length === 1;
                const newHasLost = newHasWon ? false : hasNoMoreMoves(newCards);

                setHasWon(newHasWon);
                setHasLost(newHasLost);

                const updatedMoveHistoryAfterDrop = [...moveHistory, currentBoardForHistory];
                setMoveHistory(updatedMoveHistoryAfterDrop);

                if (currentUser) {
                    (async () => {
                        setIsSavingGame(true);
                        try {
                            await saveGame(currentUser.uid, {
                                boardCards: newCards,
                                hasWon: newHasWon,
                                hasLost: newHasLost,
                                moveHistory: updatedMoveHistoryAfterDrop,
                            });
                        } catch (error: any) {
                            console.error("Error saving game after move:", error);
                            displayGameMessage(`Error saving game: ${error.message}`, 'error');
                        } finally {
                            setIsSavingGame(false);
                        }
                    })();
                }
                return newCards;
            });
        }, [currentUser, moveHistory, displayGameMessage]);

        return {
            gameState,
            isLoadingGame,
            isSavingGame,
            handleRestart,
            handleUndo,
            handleCardDrop,
            invalidMoveCards: invalidMoveCardsState,
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
                const timer = setTimeout(() => setShowHint(false), 2000);
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
        onEditAccount,
        onInfo,
        currentUser
    }: {
        onRestart: () => void;
        onUndo: () => void;
        onHint: () => void;
        hint: HintMove | null;
        hasWon: boolean;
        hasLost: boolean;
        moveHistory: CardType[][];
        onEditAccount: () => void;
        onInfo: () => void;
        currentUser: any;
    }) => (
        <div className="flex gap-2">
            <button
                onClick={onHint}
                disabled={hint === null || hasWon || hasLost}
                className="round-btn"
                aria-label="Hint"
            >
                <MdLightbulb size={26} />
            </button>
            <button
                onClick={onUndo}
                disabled={moveHistory.length === 0 || hasWon || hasLost}
                className="round-btn"
                aria-label="Undo"
            >
                <MdUndo size={26} />
            </button>
            <button
                onClick={onRestart}
                className="round-btn"
                aria-label="Restart Game"
            >
                <MdRestartAlt size={26} />
            </button>
            <button
                onClick={onInfo}
                className="round-btn"
                aria-label="Game Rules"
            >
                <MdInfo size={26} />
            </button>
            <button
                onClick={onEditAccount}
                disabled={!currentUser}
                className="round-btn"
                aria-label="Edit Account"
            >
                <MdEdit size={26} />
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
            <div
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)'
                }}
            >
                <div className={`${hasWon ? 'bg-yellow-300 text-green-900' : 'bg-red-300 text-red-900'} p-8 rounded-lg shadow-xl text-center`}>
                    <h2 className="text-4xl font-bold mb-4">
                        {hasWon ? '🎉 Congratulations! You Win! 🎉' : 'Game Over! 😥'}
                    </h2>
                    <p className="text-lg mb-4">
                        {hasWon ? "You've successfully consolidated all cards!" : 'No more valid moves left.'}
                    </p>
                    <button
                        onClick={onRestart}
                        className={`${hasWon
                            ? 'bg-green-600 hover:bg-green-800'
                            : 'bg-blue-600 hover:bg-blue-800'
                            } text-white font-bold py-3 px-6 rounded-lg text-xl`}
                    >
                        {hasWon ? 'Play Again!' : 'Try Again!'}
                    </button>
                </div>
            </div>
        );
    });

    GameOverlay.displayName = 'GameOverlay';

    // Rules overlay component
    const RulesOverlay = React.memo(({
        isVisible,
        onClose
    }: {
        isVisible: boolean;
        onClose: () => void;
    }) => {
        if (!isVisible) return null;

        return (
            <div
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)'
                }}
                onClick={onClose}
            >
                <div
                    className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl text-center max-w-md mx-4 p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Game Rules</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        A card can be stacked on its immediate left neighbor or the card three positions to its left if they match in suit or rank.
                    </p>
                    <button
                        onClick={onClose}
                        className="mt-6 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        );
    });

    RulesOverlay.displayName = 'RulesOverlay';

    const { currentUser: authUser, handleLogout } = useAuth(displayGameMessage);
    const {
        gameState: { boardCards, hasWon, hasLost, moveHistory },
        isLoadingGame,
        // isSavingGame,
        handleRestart,
        handleUndo,
        handleCardDrop,
        invalidMoveCards,
    } = useGameState(authUser, displayGameMessage);
    const { hint, showHint, setShowHint } = useHint(boardCards, hasWon, hasLost);

    // Add a function to save the game on logout
    const saveGameOnLogout = useCallback(async () => {
        if (authUser) {
            await saveGame(authUser.uid, {
                boardCards,
                hasWon,
                hasLost,
                moveHistory,
            });
            displayGameMessage('Game saved!', 'success');
        }
    }, [authUser, boardCards, hasWon, hasLost, moveHistory, displayGameMessage]);

    // Local logout handler that saves the game before logging out
    const handleLogoutWithSave = useCallback(async () => {
        await saveGameOnLogout();
        // Wait 3 seconds before logging out so the toast is visible
        await new Promise(resolve => setTimeout(resolve, 3000));
        handleLogout();
    }, [saveGameOnLogout, handleLogout]);

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
            <div
                className="flex items-center justify-center text-white text-3xl font-bold"
                style={{
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    padding: '1rem'
                }}
            >
                Loading game...
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4">
            {showRotate && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.92)',
                        color: 'white',
                        fontSize: '2rem',
                        height: '100vh',
                        width: '100vw',
                        textAlign: 'center'
                    }}
                >
                    <span style={{ marginBottom: '1.5rem', fontSize: '5rem' }}>🔄</span>
                    <p>Please rotate your device for the best experience.</p>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

            <GameOverlay hasWon={hasWon} hasLost={hasLost} onRestart={handleRestart} />
            <RulesOverlay isVisible={showRules} onClose={() => setShowRules(false)} />

            {/* Header row: always full viewport width */}
            <div className="flex justify-between items-start my-4 w-screen max-w-none absolute left-0 right-0 px-4" style={{ top: 0 }}>
                <img
                    src="/accordion-main-logo.jpeg"
                    alt="Accordion Logo"
                    className="game-logo game-header-content"
                    style={{
                        display: 'block',
                        paddingLeft: '2rem',
                        paddingTop: '2rem',
                        userSelect: 'none',
                        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
                    }}
                />

                <div className="flex items-center gap-2 game-header-content" style={{ marginTop: '2rem' }}>
                    <GameControls
                        onRestart={handleRestart}
                        onUndo={handleUndo}
                        onHint={() => {
                            if (hint) {
                                setShowHint(true);
                            } else {
                                displayGameMessage('No valid moves available!', 'info');
                            }
                        }}
                        hint={hint}
                        hasWon={hasWon}
                        hasLost={hasLost}
                        moveHistory={moveHistory}
                        onEditAccount={() => setEditModalOpen(true)}
                        onInfo={() => setShowRules(true)}
                        currentUser={authUser}
                    />
                    {authUser ? (
                        <button
                            onClick={handleLogoutWithSave}
                            className="round-btn logout"
                            aria-label="Logout"
                        >
                            <MdLogout size={26} />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="round-btn login"
                            aria-label="Login / Save Game"
                        >
                            <MdLogin size={26} />
                        </button>
                    )}
                </div>
                <div style={{ marginTop: '1rem', marginRight: '1rem' }}>
                    {authUser && (
                        <p
                            className="text-white text-md px-3 py-1 bg-green-600 rounded-full"
                            style={{ alignSelf: 'flex-end', opacity: '0.9', fontFamily: 'Futura' }}
                        >
                            {authUser.displayName || ' '}&nbsp;&nbsp;
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-center items-center" style={{ minHeight: '100vh' }}>
                {/* Vertically centered card area */}
                <div
                    style={{ paddingLeft: '2rem', paddingRight: '1rem' }}
                    className="flex flex-wrap gap-2"
                >
                    {renderedCards}
                </div>
            </div>

            <AccountEditModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                currentUser={authUser}
            />
        </div>
    );
};

export default React.memo(Game);
