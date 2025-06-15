import React, { useState, useEffect } from 'react';
import Card from './Card';

// Helper function to create a standard 52-card deck
const createDeck = () => {
  const suits = ['H', 'D', 'C', 'S'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit: suit as 'H' | 'D' | 'C' | 'S', rank });
    }
  }
  return deck;
};

// Helper function to shuffle a deck (Fisher-Yates shuffle)
const shuffleDeck = (deck: Array<{ suit: 'H' | 'D' | 'C' | 'S'; rank: string }>) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
  }
  return deck;
};

const GameBoard: React.FC = () => {
  const [cards, setCards] = useState<Array<{ suit: 'H' | 'D' | 'C' | 'S'; rank: string }>>([]);

  useEffect(() => {
    const newDeck = shuffleDeck(createDeck());
    setCards(newDeck);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-200 rounded-lg shadow-inner w-full max-w-6xl mx-auto min-h-[400px]">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Accordion Solitaire</h2>

      {/* This div will hold all the cards, arranging them in a row that wraps */}
      <div className="flex flex-wrap justify-center gap-2 p-4 border border-gray-400 rounded-md bg-gray-100 min-h-[300px]">
        {cards.map((card, index) => (
          <Card
            key={`<span class="math-inline">\{card\.rank\}\-</span>{card.suit}-${index}`} // Unique key for each card
            suit={card.suit}
            rank={card.rank}
            position={{ x: 0, y: 0 }} // Placeholder position for now
          />
        ))}
      </div>

      <p className="mt-6 text-sm text-gray-600">
        Cards are dealt! Next, we'll implement drag-and-drop and game logic.
      </p>
    </div>
  );
};

export default GameBoard;