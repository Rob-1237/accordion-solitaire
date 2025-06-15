import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Card from './Card';

import { generateDeck, shuffleDeck } from '../utils/deckUtils';
import { isValidMove, hasNoMoreMoves, findHintMove } from '../utils/gameLogic';
import type { CardType, HintMove } from '../types/card';

import { saveGame, loadGame } from '../services/firebaseService';

const Game: React.FC = () => {
    const navigate = useNavigate();
    const [boardCards, setBoardCards] = useState<CardType[]>([]);
    const [hasWon, setHasWon] = useState<boolean>(false);
    const [hasLost, setHasLost] = useState<boolean>(false);
    const [moveHistory, setMoveHistory] = useState<CardType[][]>([]);
    const [hint, setHint] = useState<HintMove | null>(null);
    const [showHint, setShowHint] = useState<boolean>(false);
    const [invalidMoveCards, setInvalidMoveCards] = useState<{ draggedId: string | null, targetId: string | null }>({
        draggedId: null,
        targetId: null
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingGame, setIsLoadingGame] = useState<boolean>(true);

    // Effect 1: Listen for authentication state changes (runs once on mount)
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user); // Set the current user state
        });

        // Cleanup the subscription when the component unmounts
        return () => unsubscribe();
    }, []); // Empty dependency array means this runs once on mount

    // Effect 2: Load game state or start a new game when currentUser changes
    useEffect(() => {
        const initializeOrLoadGame = async () => {
            setIsLoadingGame(true); // Set loading state to true

            if (currentUser) {
                // User is logged in, attempt to load their saved game
                try {
                    const loadedData = await loadGame(currentUser.uid);
                    console.log("Step 1: Loaded moveHistory from Firestore:", loadedData?.moveHistory); // ADD THIS
        console.log("Step 2: Current local moveHistory BEFORE set:", moveHistory); // ADD THIS (Note: this is the state from previous render cycle)
       
                    if (loadedData) {
                        // If a game was loaded, populate the component's state
                        setBoardCards(loadedData.boardCards);
                        setHasWon(loadedData.hasWon);
                        setHasLost(loadedData.hasLost);
                        setMoveHistory(loadedData.moveHistory || []); // Ensure history is an array
                        console.log("Game loaded successfully from Firestore for user:", currentUser.uid);
                    } else {
                        // No saved game found, start a brand new game for this user
                        console.log("No saved game found, starting a new game for user:", currentUser.uid);
                        const initialDeck = generateDeck();
                        const shuffled = shuffleDeck(initialDeck);
                        setBoardCards(shuffled);
                        setHasWon(false);
                        setHasLost(false);
                        setMoveHistory([]);
                        // Automatically save this initial new game state to Firestore
                        await saveGame(currentUser.uid, { boardCards: shuffled, hasWon: false, hasLost: false, moveHistory: [] });
                    }
                } catch (error) {
                    console.error("Error loading or saving initial game:", error);
                    // Fallback: If loading/saving fails, still start a new game to allow play
                    const initialDeck = generateDeck();
                    const shuffled = shuffleDeck(initialDeck);
                    setBoardCards(shuffled);
                    setHasWon(false);
                    setHasLost(false);
                    setMoveHistory([]);
                }
            } else {
                // No user logged in (e.g., initial visit or after logout).
                // Start a new game, but it won't be associated with a user for saving.
                console.log("No user logged in, starting a new game (not savable).");
                const initialDeck = generateDeck();
                const shuffled = shuffleDeck(initialDeck);
                setBoardCards(shuffled);
                setHasWon(false);
                setHasLost(false);
                setMoveHistory([]);
            }
            setIsLoadingGame(false); // End loading state
        };

        // This ensures the game initialization/loading logic runs only after `currentUser`
        // has been set by the `onAuthStateChanged` listener.
        if (currentUser !== undefined) { // Check if currentUser state has been definitively set (null or User object)
            initializeOrLoadGame();
        }
    }, [currentUser]); // This effect re-runs whenever `currentUser` changes.

    // This useEffect will recalculate the hint whenever the board, win, or loss state changes.
    // This is what populates the 'hint' state.
    useEffect(() => {
        if (hasWon || hasLost) {
            setHint(null); // Clear hint if game is over
        } else {
            setHint(findHintMove(boardCards)); // This calls your findHintMove function
        }
    }, [boardCards, hasWon, hasLost]); // Dependencies: recalculate when these states change

    // Add useEffect to clear invalid move feedback after 1500ms
    useEffect(() => {
        if (invalidMoveCards.draggedId || invalidMoveCards.targetId) {
            const timer = setTimeout(() => {
                setInvalidMoveCards({ draggedId: null, targetId: null });
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [invalidMoveCards]);

    // Add useEffect to clear hint after 3000ms
    useEffect(() => {
        if (showHint) {
            const timer = setTimeout(() => {
                setShowHint(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showHint]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleRestart = () => {
        const newDeck = shuffleDeck(generateDeck());
        setBoardCards(newDeck);
        setHasWon(false);
        setHasLost(false);
        setMoveHistory([]);
        setShowHint(false);

        if (currentUser) {
            // Save the new, restarted game state
            saveGame(currentUser.uid, { boardCards: newDeck, hasWon: false, hasLost: false, moveHistory: [] });
        }
    };

    const handleUndo = () => {
        console.log("Step 3: moveHistory at start of handleUndo:", moveHistory); // ADD THIS

        if (moveHistory.length > 0) {
            const previousBoard = moveHistory[moveHistory.length - 1];
            const updatedMoveHistory = moveHistory.slice(0, moveHistory.length - 1); // Get history AFTER undo

            setBoardCards(previousBoard);
            setMoveHistory(updatedMoveHistory); // Update state with sliced history
            setHasWon(false);
            setHasLost(false);
            setShowHint(false);

            if (currentUser) {
                // Save the state after undoing the move
                saveGame(currentUser.uid, { boardCards: previousBoard, hasWon: false, hasLost: false, moveHistory: updatedMoveHistory });
            }
        }
    };

    const handleCardDrop = (draggedCardId: string, targetCardId: string) => {
        setBoardCards(prevCards => {
            // 1. Find indices of the dragged and target cards
            const draggedIndex = prevCards.findIndex(card => card.id === draggedCardId);
            const targetIndex = prevCards.findIndex(card => card.id === targetCardId);

            // 2. Basic validation: If cards not found or dropping on self, return
            if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
                console.warn("Invalid drop: Card not found, or dropping on self.");
                setInvalidMoveCards({ draggedId: draggedCardId, targetId: targetCardId });
                return prevCards;
            }

            // 3. Get the actual card objects
            const draggedCard = prevCards[draggedIndex];
            const targetCard = prevCards[targetIndex];

            // 4. Validate the move based on game rules (suit/rank and position)
            if (!isValidMove(draggedCard, targetCard, draggedIndex, targetIndex)) {
                console.log(`Invalid move from ${draggedCard.id} to ${targetCard.id}`);
                setInvalidMoveCards({ draggedId: draggedCardId, targetId: targetCardId });
                return prevCards;
            }

            // Clear any invalid move feedback when a valid move is made
            setInvalidMoveCards({ draggedId: null, targetId: null });

            // --- START OF NEW/MODIFIED CODE FOR SAVE/LOAD INTEGRATION ---

            // NEW LINE: Capture the current board state *before* it's modified.
            // This is crucial because it's the state we add to move history for 'Undo'.
            const currentBoardForHistory = [...prevCards];


            // Perform the actual card manipulation to create the new board state
            const newCards = [...prevCards];
            // Remove the dragged card from its original position
            const [cardToMove] = newCards.splice(draggedIndex, 1);

            // Calculate the effective target index after splicing (to account for shifted indices).
            const effectiveTargetIndex = (draggedIndex < targetIndex) ? targetIndex - 1 : targetIndex;

            // Place the dragged card at the target's position
            newCards.splice(effectiveTargetIndex, 1, cardToMove);


            // Determine hasWon and hasLost conditions for the *new* state, after the move.
            const newHasWon = newCards.length === 1;
            const newHasLost = newHasWon ? false : hasNoMoreMoves(newCards);

            // Update local state for win/loss, hint, etc.
            setHasWon(newHasWon);
            setHasLost(newHasLost);
            setShowHint(false);


            // NEW/MODIFIED BLOCK: This entire if/else block is new/modified logic.
            // It handles updating move history AND saving the game based on user login status.
            if (currentUser) {
                // NEW LINE: Create the UP-TO-DATE move history array.
                // It includes all previous history AND the board state *before* this move.
                const updatedMoveHistoryAfterDrop = [...moveHistory, currentBoardForHistory];

                // NEW LINE: Update the local React state for moveHistory.
                setMoveHistory(updatedMoveHistoryAfterDrop);

                // NEW LINE: Call saveGame!
                // We pass the current user's ID, and the complete, current game state data.
                // This includes the new board, the new win/loss status, and the updated move history.
                saveGame(currentUser.uid, {
                    boardCards: newCards,          // The board AFTER the move
                    hasWon: newHasWon,             // The win status AFTER the move
                    hasLost: newHasLost,           // The loss status AFTER the move
                    moveHistory: updatedMoveHistoryAfterDrop, // The move history INCLUDING the state just before this move
                });
            } else {
                // This block is for anonymous users (not logged in).
                // They don't save, but their local move history should still be updated.
                // This line replaces or confirms your previous setMoveHistory for non-logged-in users.
                setMoveHistory(prevHistory => [...prevHistory, currentBoardForHistory]);
            }
            // --- END OF NEW/MODIFIED CODE FOR SAVE/LOAD INTEGRATION ---

            return newCards; // Return the new board state for setBoardCards
        });
    };


    if (isLoadingGame) {
        return (
            <div className="min-h-screen bg-green-700 p-4 flex items-center justify-center text-white text-3xl font-bold">
                Loading game...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-700 p-4">
            {/* You Win! Overlay */}
            {hasWon && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="bg-yellow-300 text-green-900 p-8 rounded-lg shadow-xl text-center">
                        <h2 className="text-4xl font-bold mb-4">🎉 Congratulations! You Win! 🎉</h2>
                        <p className="text-lg mb-4">You've successfully consolidated all cards!</p>
                        <button
                            onClick={handleRestart}
                            className="bg-green-600 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg text-xl"
                        >
                            Play Again!
                        </button>
                    </div>
                </div>
            )}

            {/* Game Over! Overlay */}
            {(hasLost && !hasWon) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="bg-red-300 text-red-900 p-8 rounded-lg shadow-xl text-center">
                        <h2 className="text-4xl font-bold mb-4">Game Over! 😥</h2>
                        <p className="text-lg mb-4">No more valid moves left.</p>
                        <button
                            onClick={handleRestart}
                            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg text-xl"
                        >
                            Try Again!
                        </button>
                    </div>
                </div>
            )}

            {/* Header with Game Title and Action Buttons */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-white">Accordion Solitaire</h1>
                <div>
                    {/* NEW: Hint Button - Added here */}
                    <button
                        onClick={() => setShowHint(prev => !prev)}
                        disabled={hint === null || hasWon || hasLost}
                        className={`font-bold py-2 px-4 rounded mr-2 ${hint === null || hasWon || hasLost
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : showHint
                                ? 'bg-purple-700 text-white' // Active state when hint is showing
                                : 'bg-purple-500 hover:bg-purple-700 text-white'
                            }`}
                    >
                        {showHint ? 'Hint Active' : 'Hint'}
                    </button>

                    {/* Existing Undo Button */}
                    <button
                        onClick={handleUndo}
                        // Button is disabled if no moves have been made, or if the game is over (won/lost)
                        disabled={moveHistory.length === 0 || hasWon || hasLost}
                        className={`font-bold py-2 px-4 rounded mr-2 ${moveHistory.length === 0 || hasWon || hasLost
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed' // Disabled style
                            : 'bg-yellow-500 hover:bg-yellow-700 text-white' // Enabled style
                            }`}
                    >
                        Undo
                    </button>

                    {/* Existing Restart Button */}
                    <button
                        onClick={handleRestart}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                        Restart Game
                    </button>

                    {/* CONDITIONAL LOGOUT BUTTON */}
                    {currentUser ? ( // Only render if currentUser exists (i.e., user is logged in)
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Logout
                        </button>
                    ) : ( // If no currentUser, offer a "Login" or "Save Game" option
                        <button
                            onClick={() => navigate('/login')} // Navigate to the login page
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Login / Save Game
                        </button>
                    )}

                </div>
            </div>

            {/* Card Display Area */}
            <div className="flex flex-wrap gap-2 justify-center">
                {boardCards.map(card => (
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
                ))}
            </div>
        </div>
    );
};

export default Game;