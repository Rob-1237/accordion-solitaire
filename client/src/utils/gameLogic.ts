import type { CardType, HintMove } from '../types/card';

/**
 * Checks if a proposed move in Accordion Solitaire is valid.
 * A card can be moved if it matches suit OR rank with a card 1 or 3 positions to its left.
 * @param draggedCard The card being moved.
 * @param targetCard The card it's being moved onto.
 * @param draggedIndex The current index of the dragged card on the board.
 * @param targetIndex The current index of the target card on the board.
 * @returns boolean - true if the move is valid, false otherwise.
 */
export const isValidMove = (
    draggedCard: CardType,
    targetCard: CardType,
    draggedIndex: number,
    targetIndex: number
): boolean => {
    // Rule 1: Dragged card must be to the LEFT of the target card (moving from right to left)
    // In Accordion Solitaire, you typically move a card onto another card that is to its left.
    if (draggedIndex <= targetIndex) {
        return false;
    }

    const distance = draggedIndex - targetIndex; // Distance is positive since draggedIndex > targetIndex

    // Rule 2: Must be exactly 1 or 3 positions away
    if (distance !== 1 && distance !== 3) {
        return false;
    }

    // Rule 3: Must match suit OR rank
    const sameSuit = draggedCard.suit === targetCard.suit;
    const sameRank = draggedCard.rank === targetCard.rank;

    if (!sameSuit && !sameRank) {
        return false;
    }

    // If all rules pass
    return true;
};

/**
 * Checks if there are any valid moves left on the board.
 * A game is lost if no card can be moved onto another according to Accordion Solitaire rules.
 * @param boardCards The current array of cards on the board.
 * @returns boolean - true if no more valid moves are found, false otherwise.
 */
export const hasNoMoreMoves = (boardCards: CardType[]): boolean => {
    // If there's only one card, the game is won, not stuck.
    if (boardCards.length === 1) {
        return false;
    }

    // Iterate through each card as a potential 'draggedCard'
    for (let draggedIndex = 0; draggedIndex < boardCards.length; draggedIndex++) {
        const draggedCard = boardCards[draggedIndex];

        // For each potential 'draggedCard', iterate through all other cards
        // as potential 'targetCard' to see if a valid move exists.
        for (let targetIndex = 0; targetIndex < boardCards.length; targetIndex++) {
            // A card cannot be moved onto itself.
            if (draggedIndex === targetIndex) {
                continue;
            }

            const targetCard = boardCards[targetIndex];

            // Use the existing isValidMove logic to check if this specific move is valid.
            if (isValidMove(draggedCard, targetCard, draggedIndex, targetIndex)) {
                return false; // Found at least one valid move, so the game is NOT lost.
            }
        }
    }

    // If the loops complete without finding any valid moves, then the game is lost.
    return true;
};

/**
 * Finds the first available valid move on the board.
 * @param boardCards The current array of cards on the board.
 * @returns A HintMove object (draggedCardId, targetCardId) if a move is found, otherwise null.
 */
export const findHintMove = (boardCards: CardType[]): HintMove | null => {
    // Iterate through each card as a potential 'draggedCard'
    for (let draggedIndex = 0; draggedIndex < boardCards.length; draggedIndex++) {
        const draggedCard = boardCards[draggedIndex];

        // For each potential 'draggedCard', iterate through all other cards
        // as potential 'targetCard' to see if a valid move exists.
        for (let targetIndex = 0; targetIndex < boardCards.length; targetIndex++) {
            // A card cannot be moved onto itself.
            if (draggedIndex === targetIndex) {
                continue;
            }

            const targetCard = boardCards[targetIndex];

            // Use the existing isValidMove logic
            if (isValidMove(draggedCard, targetCard, draggedIndex, targetIndex)) {
                // If a valid move is found, return its IDs immediately
                return {
                    draggedCardId: draggedCard.id,
                    targetCardId: targetCard.id,
                };
            }
        }
    }

    return null; // No valid moves found
};