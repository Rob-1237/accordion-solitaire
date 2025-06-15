// client/src/utils/deckUtils.ts
import type { CardType } from '../types/card';

/**
 * Generates a standard 52-card deck.
 * @returns An array of CardType objects representing a full deck.
 */
export const generateDeck = (): CardType[] => {
    const suits = ['H', 'D', 'C', 'S'] as const; // Hearts, Diamonds, Clubs, Spades
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: CardType[] = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            // THIS LINE IS THE CRITICAL FIX: Ensure it's exactly like this.
            deck.push({ id: `${rank}${suit}`, rank, suit }); // Unique ID for React keys and D&D
        }
    }
    return deck;
};

/**
 * Shuffles a given deck of cards using the Fisher-Yates algorithm.
 * @param deck The array of CardType objects to shuffle.
 * @returns The shuffled array of CardType objects.
 */
export const shuffleDeck = (deck: CardType[]): CardType[] => {
    let currentIndex = deck.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [deck[currentIndex], deck[randomIndex]] = [deck[randomIndex], deck[currentIndex]];
    }
    return deck;
};