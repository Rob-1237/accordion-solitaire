import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';

// Define the drag item type (used by react-dnd)
export const ItemTypes = {
  CARD: 'card',
};

// Define the props interface for the Card component
interface CardProps {
  id: string; // Unique ID for this card (e.g., "AS", "10H")
  rank: string; // Rank of the card (e.g., "A", "2", "K")
  suit: string; // Suit of the card (e.g., "H", "D", "C", "S")
  onDropCard: (draggedId: string, targetId: string) => void; // Callback for when a card is dropped on this card
  gameEnded: boolean; // New prop: true if the game has ended (won or lost)
  isHintDragged: boolean; // <-- Add this line
  isHintTarget: boolean;   // <-- Add this line
  isInvalidDragged: boolean;
  isInvalidTarget: boolean;
}

const Card: React.FC<CardProps> = ({
    id,
    rank,
    suit,
    onDropCard,
    gameEnded,
    isHintDragged,
    isHintTarget,
    isInvalidDragged,
    isInvalidTarget
}) => {
  // Create refs for drag and drop
  const dragRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // useDrag hook: Makes this component draggable
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id, rank, suit },
    canDrag: !gameEnded,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // useDrop hook: Makes this component a valid drop target
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: { id: string }) => {
      onDropCard(item.id, id);
    },
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  // Combine the refs
  drag(dragRef);
  drop(dropRef);

  // Determine card color for styling
  const textColor = (suit === 'H' || suit === 'D') ? 'text-red-600' : 'text-black';

  // Opacity for visual feedback when dragging
  const opacity = isDragging ? 0.5 : 1;

  // Border style for drop target feedback
  let borderClass = '';
  if (isOver && canDrop) {
    borderClass = 'border-4 border-yellow-400'; // Highlight when hovering over a valid drop target
  } else if (canDrop && !isDragging) {
    // Optional: could add a subtle border for all potential drop targets
    // borderClass = 'border-2 border-gray-300';
  }

  return (
    <div
      ref={dropRef}
      style={{
        width: '100px',
        height: '140px',
        opacity,
        margin: '5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px',
        fontSize: '24px',
        fontWeight: 'bold',
        position: 'relative',
      }}
      className={`
        bg-white rounded-lg shadow-md flex flex-col items-center justify-center
        text-2xl font-bold border-2
        ${suit === 'Hearts' || suit === 'Diamonds' ? 'text-red-600' : 'text-gray-800'}
        ${isDragging ? 'opacity-50 border-blue-400' : 'opacity-100'}
        ${gameEnded ? 'cursor-not-allowed' : 'cursor-grab'}
        ${canDrop && isOver ? 'border-green-500' : 'border-transparent'}
        ${isHintDragged ? 'border-4 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-[pulse_1s_ease-in-out_infinite]' : ''}
        ${isHintTarget ? 'border-4 border-lime-500 shadow-[0_0_15px_rgba(132,204,22,0.5)] animate-[pulse_1s_ease-in-out_infinite]' : ''}
        ${isInvalidDragged ? 'border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[shake_0.5s_ease-in-out]' : ''}
        ${isInvalidTarget ? 'border-4 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-[shake_0.5s_ease-in-out]' : ''}
        transition-all duration-300
      `}
    >
      <div
        ref={dragRef}
        className={`absolute inset-0 flex flex-col justify-between items-center p-2 ${textColor}`}
        style={{ cursor: gameEnded ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab') }}
      >
        <div className="text-left w-full pl-1">{rank}</div>
        <div className="text-center text-4xl">{getSuitSymbol(suit)}</div>
        <div className="text-right w-full pr-1 rotate-180">{rank}</div>
      </div>
    </div>
  );
};

// Helper function to get the Unicode symbol for a suit
const getSuitSymbol = (suit: string): string => {
  switch (suit) {
    case 'H': return '♥'; // Hearts
    case 'D': return '♦'; // Diamonds
    case 'C': return '♣'; // Clubs
    case 'S': return '♠'; // Spades
    default: return '';
  }
};

export default Card;