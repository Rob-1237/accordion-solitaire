// Card suit and rank types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

// Sprite dimensions
const SPRITE_CONFIG = {
  width: 4096,
  height: 4096,
  cardWidth: 140,
  cardHeight: 190,
  cardsPerRow: 13,
} as const;

// Card position mapping
const CARD_POSITIONS: Record<`${Rank}-${Suit}`, { row: number; col: number }> = {
  // Hearts
  'A-hearts': { row: 0, col: 0 },
  '2-hearts': { row: 0, col: 1 },
  '3-hearts': { row: 0, col: 2 },
  '4-hearts': { row: 0, col: 3 },
  '5-hearts': { row: 0, col: 4 },
  '6-hearts': { row: 0, col: 5 },
  '7-hearts': { row: 0, col: 6 },
  '8-hearts': { row: 0, col: 7 },
  '9-hearts': { row: 0, col: 8 },
  '10-hearts': { row: 0, col: 9 },
  'J-hearts': { row: 0, col: 10 },
  'Q-hearts': { row: 0, col: 11 },
  'K-hearts': { row: 0, col: 12 },
  
  // Diamonds
  'A-diamonds': { row: 1, col: 0 },
  '2-diamonds': { row: 1, col: 1 },
  '3-diamonds': { row: 1, col: 2 },
  '4-diamonds': { row: 1, col: 3 },
  '5-diamonds': { row: 1, col: 4 },
  '6-diamonds': { row: 1, col: 5 },
  '7-diamonds': { row: 1, col: 6 },
  '8-diamonds': { row: 1, col: 7 },
  '9-diamonds': { row: 1, col: 8 },
  '10-diamonds': { row: 1, col: 9 },
  'J-diamonds': { row: 1, col: 10 },
  'Q-diamonds': { row: 1, col: 11 },
  'K-diamonds': { row: 1, col: 12 },
  
  // Clubs
  'A-clubs': { row: 2, col: 0 },
  '2-clubs': { row: 2, col: 1 },
  '3-clubs': { row: 2, col: 2 },
  '4-clubs': { row: 2, col: 3 },
  '5-clubs': { row: 2, col: 4 },
  '6-clubs': { row: 2, col: 5 },
  '7-clubs': { row: 2, col: 6 },
  '8-clubs': { row: 2, col: 7 },
  '9-clubs': { row: 2, col: 8 },
  '10-clubs': { row: 2, col: 9 },
  'J-clubs': { row: 2, col: 10 },
  'Q-clubs': { row: 2, col: 11 },
  'K-clubs': { row: 2, col: 12 },
  
  // Spades
  'A-spades': { row: 3, col: 0 },
  '2-spades': { row: 3, col: 1 },
  '3-spades': { row: 3, col: 2 },
  '4-spades': { row: 3, col: 3 },
  '5-spades': { row: 3, col: 4 },
  '6-spades': { row: 3, col: 5 },
  '7-spades': { row: 3, col: 6 },
  '8-spades': { row: 3, col: 7 },
  '9-spades': { row: 3, col: 8 },
  '10-spades': { row: 3, col: 9 },
  'J-spades': { row: 3, col: 10 },
  'Q-spades': { row: 3, col: 11 },
  'K-spades': { row: 3, col: 12 },
};

// Calculate background position for a card
export const getCardSpritePosition = (rank: Rank, suit: Suit): string => {
  const position = CARD_POSITIONS[`${rank}-${suit}`];
  if (!position) {
    console.error(`Invalid card position for ${rank}-${suit}`);
    return '0 0';
  }
  
  const x = position.col * SPRITE_CONFIG.cardWidth * -1;
  const y = position.row * SPRITE_CONFIG.cardHeight * -1;
  return `${x}px ${y}px`;
};

// Get CSS class name for a card
export const getCardSpriteClass = (rank: Rank, suit: Suit): string => {
  return `card-sprite-${rank.toLowerCase()}-${suit}`;
};

// Get card dimensions based on scale
export const getCardDimensions = (scale: number = 1) => {
  return {
    width: SPRITE_CONFIG.cardWidth * scale,
    height: SPRITE_CONFIG.cardHeight * scale,
  };
}; 