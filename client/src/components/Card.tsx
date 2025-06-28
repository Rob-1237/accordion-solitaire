import React, { useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { DropTargetMonitor } from 'react-dnd';
import '../styles/card-sprite.css';
import clsx from 'clsx';

// Define the drag item type (used by react-dnd)
const ItemTypes = {
    CARD: 'card',
} as const;

const SUIT_SYMBOLS = {
    H: '♥',
    D: '♦',
    C: '♣',
    S: '♠',
} as const;

const getSuitSymbol = (suit: string) => {
    const normalizedSuit = suit.toUpperCase();
    if (normalizedSuit === 'HEARTS') return SUIT_SYMBOLS.H;
    if (normalizedSuit === 'DIAMONDS') return SUIT_SYMBOLS.D;
    if (normalizedSuit === 'CLUBS') return SUIT_SYMBOLS.C;
    if (normalizedSuit === 'SPADES') return SUIT_SYMBOLS.S;

    // If it's already H, D, C, S or other unexpected value, try to return directly from object
    return SUIT_SYMBOLS[normalizedSuit as keyof typeof SUIT_SYMBOLS] || suit;
};

const formatRank = (rank: string) => {
    switch (rank.toLowerCase()) {
        case 'ace': return 'A';
        case 'jack': return 'J';
        case 'queen': return 'Q';
        case 'king': return 'K';
        default: return rank;
    }
};

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
    margin: '5px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px',
    fontSize: '20px',
    fontWeight: 'bold',
    position: 'relative' as const,
    backgroundColor: 'rgb(255, 255, 255, .85)',
    boxSizing: 'border-box' as const,
};

const ANIMATION_CLASSES = {
    hint: 'border-4 border-purple-500 shadow-purple-500/60 shadow-2xl animate-pulse',
    target: 'border-4 border-lime-500 shadow-lime-500/80 shadow-2xl animate-pulse',
    invalid: 'border-4 border-red-500 shadow-red-500/80 shadow-2xl animate-shake',
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
    // Debug touch events
    const handleTouchStart = () => {
        console.log('Touch started on card:', id);
    };
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

    // Memoize the card styles (for inline styles like opacity/transform)
    const cardStyles = useMemo(() => {
        let backgroundColor = 'rgba(255, 255, 255, 0.85)';

        if (isInvalidDragged || isInvalidTarget) {
            backgroundColor = 'rgba(255, 100, 100, 0.5)'; // Red background for invalid
        } else if (isHintDragged || isHintTarget) {
            backgroundColor = 'rgba(100, 200, 100, 0.5)'; // Green background for hint target
        }

        return {
            opacity: isDragging ? 0.5 : 1,
            transform: isDragging ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.2s ease, opacity 0.2s ease, background-color 0.3s ease',
            backgroundColor,
        };
    }, [isDragging, isInvalidDragged, isInvalidTarget, isHintDragged, isHintTarget]);

    // Memoize the card classes using clsx for better readability and merging
    const cardClasses = useMemo(() => {
        return clsx(
            'sprite',
            `${formatSuit(suit)}-${formatRank(rank)}`,
            'rounded-lg',
            'shadow-lg', // Default shadow for all cards
            'cursor-grab',
            'select-none',
            'touch-manipulation',
            'transition-all',
            'duration-200',
            'ease-in-out',
            {
                'cursor-grabbing shadow-xl': isDragging, // Stronger shadow when dragging
                'ring-2 ring-blue-500 ring-opacity-50': isOver, // Ring on hover target
                'cursor-not-allowed opacity-75': gameEnded, // Dim and disable on game end

                // Apply shake animation for invalid moves
                [ANIMATION_CLASSES.invalid]: isInvalidDragged || isInvalidTarget,
            }
        );
    }, [rank, suit, isDragging, isOver, gameEnded, isHintDragged, isHintTarget, isInvalidDragged, isInvalidTarget, id]);

    return (
        <div
            ref={(node) => {
                // react-dnd requires the ref to be passed this way
                drag(drop(node));
            }}
            // Merge baseStyles with cardStyles for comprehensive inline styling
            style={{ ...baseStyles, ...cardStyles }}
            className={cardClasses}
            data-rank={formatRank(rank)}
            data-suit={suitSymbol}
            onTouchStart={handleTouchStart}
        >
            <span className="center-suit">{suitSymbol}</span>
        </div>
    );
});

Card.displayName = 'Card';

export default Card;