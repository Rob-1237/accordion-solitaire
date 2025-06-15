// client/src/services/firebaseService.ts

import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { CardType } from '../types/card';

// Define the shape of your saved game data in Firestore
export type SavedGameData = {
    boardCards: CardType[];
    hasWon: boolean;
    hasLost: boolean;
    moveHistory: String;
    lastSaved: Date; // Timestamp when the game was last saved
}

// A fixed document ID for the current game for a user.
const GAME_DOC_ID = "currentGame";

/**
 * Saves the current game state to Firestore for the authenticated user.
 * @param userId The unique ID of the current authenticated user.
 * @param gameState An object containing the current board state, win/loss status, and move history.
 */
export const saveGame = async (userId: string, gameState: Omit<SavedGameData, 'lastSaved'>): Promise<void> => {
  if (!userId) {
    console.error("Error saving game: No user ID provided. User must be authenticated.");
    return;
  }

  try {
    // Construct the document reference: users/{userId}/games/{GAME_DOC_ID}
    const gameDocRef = doc(db, "users", userId, "games", GAME_DOC_ID);

    // Use setDoc to write the data. It will create the document if it doesn't exist,
    // or overwrite it if it does.
    await setDoc(gameDocRef, {
        boardCards: gameState.boardCards, // Keep existing fields
        hasWon: gameState.hasWon,
        hasLost: gameState.hasLost,
        moveHistory: JSON.stringify(gameState.moveHistory),
        lastSaved: new Date(),
    });
    console.log("Game state saved successfully to Firestore!");
  } catch (error) {
    console.error("Error saving game state:", error);
    throw error;
  }
};

/**
 * Loads the game state from Firestore for the authenticated user.
 * @param userId The unique ID of the current authenticated user.
 * @returns A Promise that resolves to the SavedGameData object if found, otherwise null.
 */
export const loadGame = async (userId: string): Promise<SavedGameData | null> => {
  if (!userId) {
    console.error("Error loading game: No user ID provided. User must be authenticated.");
    return null;
  }

  try {
    // Construct the document reference
    const gameDocRef = doc(db, "users", userId, "games", GAME_DOC_ID);
    const gameDocSnap = await getDoc(gameDocRef); // Get the document snapshot

    if (gameDocSnap.exists()) {
      // If the document exists, return its data
      const data = gameDocSnap.data() as SavedGameData;
      console.log("Game state loaded successfully from Firestore!");
      return {
        boardCards: data.boardCards,
        hasWon: data.hasWon,
        hasLost: data.hasLost,
        moveHistory: JSON.parse(data.moveHistory as string), // <-- CHANGED: Parse the string back to array
        lastSaved: data.lastSaved.toDate(), // Firestore Timestamps need .toDate()
      } as SavedGameData; // Cast to ensure type compatibility
      } else {
      // Document does not exist (no saved game)
      console.log("No saved game found for this user.");
      return null;
    }
  } catch (error) {
    console.error("Error loading game state:", error);
    throw error;
  }
};