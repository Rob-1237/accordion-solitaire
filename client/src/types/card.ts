export interface CardType {
    id: string;
    rank: string;
    suit: 'H' | 'D' | 'C' | 'S';
}

export interface HintMove {
    draggedCardId: string;
    targetCardId: string;
} 