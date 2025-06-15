import React, { useRef, useMemo, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import '../styles/card-sprite.css';

// Define the drag item type (used by react-dnd)
const ItemTypes = {
  CARD: 'card',
} as const;

// Move suit symbols to a constant
const SUIT_SYMBOLS = {
  H: '♥',
  D: '♦',
  C: '♣',
  S: '♠',
} as const;

// Helper function to get suit symbol
const getSuitSymbol = (suit: string) => {
  switch (suit) {
    case 'hearts': return '♥';
    case 'diamonds': return '♦';
    case 'clubs': return '♣';
    case 'spades': return '♠';
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
    case 'S': return '♠';
    default: return suit;
  }
};

// Helper function to format the rank for the class name
const formatRank = (rank: string) => {
  switch (rank.toLowerCase()) {
    case 'ace': return 'A';
    case 'jack': return 'J';
    case 'queen': return 'Q';
    case 'king': return 'K';
    default: return rank;
  }
};

// Helper function to format the suit for the class name
const formatSuit = (suit: string) => {
  switch (suit.toLowerCase()) {
    case 'hearts': return 'H';
    case 'diamonds': return 'D';
    case 'clubs': return 'C';
    case 'spades': return 'S';
    default: return suit;
  }
};

// Define the props interface for the Card component
interface CardProps {
  id: string;
  rank: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'H' | 'D' | 'C' | 'S';
  onDropCard: (draggedId: string, targetId: string) => void;
  gameEnded: boolean;
  isHintDragged?: boolean;
  isHintTarget?: boolean;
  isInvalidDragged?: boolean;
  isInvalidTarget?: boolean;
}

// Base styles that don't change
const baseStyles = {
  width: '100px',
  height: '140px',
  margin: '5px',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px',
  fontSize: '24px',
  fontWeight: 'bold',
  position: 'relative' as const,
};

// Animation classes
const ANIMATION_CLASSES = {
  hint: 'border-4 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-[pulse_1s_ease-in-out_infinite]',
  target: 'border-4 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.5)] animate-[pulse_1s_ease-in-out_infinite]',
  invalid: 'border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[shake_0.5s_ease-in-out]',
};

const Card: React.FC<CardProps> = React.memo(({
  id,
  rank,
  suit,
  onDropCard,
  gameEnded,
  isHintDragged,
  isHintTarget,
  isInvalidDragged,
  isInvalidTarget,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !gameEnded,
  }));

  const [{ isOver }, drop] = useDrop<{ id: string }, void, { isOver: boolean }>(() => ({
    accept: ItemTypes.CARD,
    drop: (item: { id: string }) => {
      if (item.id !== id) {
        onDropCard(item.id, id);
      }
    },
    collect: (monitor: DropTargetMonitor<{ id: string }, void>) => ({
      isOver: !!monitor.isOver(),
    }),
    canDrop: () => !gameEnded,
  }));

  // Memoize the suit symbol
  const suitSymbol = useMemo(() => getSuitSymbol(suit), [suit]);

  // Memoize the card styles
  const cardStyles = useMemo(() => ({
    opacity: isDragging ? 0.5 : 1,
    transform: isDragging ? 'scale(0.95)' : 'scale(1)',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
  }), [isDragging]);

  // Memoize the card classes
  const cardClasses = useMemo(() => {
    const baseClasses = [
      'sprite',
      `${formatSuit(suit)}-${formatRank(rank)}`,
      'rounded-lg',
      'shadow-lg',
      'cursor-grab',
      'select-none',
      'touch-manipulation',
      'transition-all',
      'duration-200',
      'ease-in-out',
    ];

    const stateClasses = [
      isDragging && 'cursor-grabbing shadow-xl',
      isOver && 'ring-2 ring-blue-500 ring-opacity-50',
      gameEnded && 'cursor-not-allowed opacity-75',
      isHintDragged && 'animate-pulse ring-2 ring-purple-500',
      isHintTarget && 'animate-pulse ring-2 ring-green-500',
      isInvalidDragged && 'animate-shake ring-2 ring-red-500',
      isInvalidTarget && 'animate-shake ring-2 ring-red-500',
    ].filter(Boolean);

    return [...baseClasses, ...stateClasses].join(' ');
  }, [rank, suit, isDragging, isOver, gameEnded, isHintDragged, isHintTarget, isInvalidDragged, isInvalidTarget]);

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      style={cardStyles}
      className={cardClasses}
      data-rank={formatRank(rank)}
      data-suit={suitSymbol}
    >
      <span className="center-suit">{suitSymbol}</span>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;