import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Card from './Card';

// Import modularized utility functions
import { generateDeck, shuffleDeck } from '../utils/deckUtils';
import { isValidMove, hasNoMoreMoves, findHintMove } from '../utils/gameLogic';
import type { CardType, HintMove } from '../types/card';

// Define CardType directly in this file as a workaround for import issues
// interface CardType {
//     id: string;
//     rank: string;
//     suit: 'H' | 'D' | 'C' | 'S';
// }

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

    useEffect(() => {
        // Initialize and shuffle the deck when the component mounts
        const initialDeck = generateDeck();
        const shuffled = shuffleDeck(initialDeck);
        setBoardCards(shuffled);
    }, []);

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
    };

    const handleUndo = () => {
        if (moveHistory.length > 0) {
            const previousBoard = moveHistory[moveHistory.length - 1];
            setBoardCards(previousBoard);
            setMoveHistory(prevHistory => prevHistory.slice(0, prevHistory.length - 1));
            setHasWon(false);
            setHasLost(false);
            setShowHint(false);
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

            // --- START OF NEW CHANGE FOR MOVE HISTORY (Step 27) ---
            // 5. Store the current board state (before applying the move) into history.
            // This is the state we'd revert to if the player clicks "Undo".
            setMoveHistory(prevHistory => [...prevHistory, prevCards]);
            // --- END OF NEW CHANGE ---


            // 6. Perform the actual card manipulation to create the new board state
            const newCards = [...prevCards];
            // Remove the dragged card from its original position
            const [cardToMove] = newCards.splice(draggedIndex, 1);

            // Calculate the effective target index after splicing (to account for shifted indices).
            // If the dragged card was to the left of the target, removing it shifts subsequent indices.
            const effectiveTargetIndex = (draggedIndex < targetIndex) ? targetIndex - 1 : targetIndex;

            // Place the dragged card at the target's position
            newCards.splice(effectiveTargetIndex, 1, cardToMove);


            // 7. Check for Win/Loss conditions based on the new board state
            if (newCards.length === 1) {
                setHasWon(true);
                setHasLost(false); // Ensure lost state is false if game is won
            } else {
                // Only check for loss if the game hasn't been won
                if (hasNoMoreMoves(newCards)) {
                    setHasLost(true); // Set hasLost to true if no valid moves left
                    setHasWon(false); // Ensure won state is false if game is lost
                } else {
                    // Important: If a move was made and it's not a win, ensure hasLost is false.
                    // This covers cases where a previous board state might have had no moves,
                    // but the current move opened up new possibilities.
                    setHasLost(false);
                }
            }

            setShowHint(false);

            // 8. Return the new board state
            return newCards;
        });
    };

    // In Game.tsx, within the Game component:

    // In Game.tsx, within the Game component:

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
                        className={`font-bold py-2 px-4 rounded mr-2 ${
                            hint === null || hasWon || hasLost
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

                    {/* Existing Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Logout
                    </button>
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