import type { MemoryMatchState } from '../../types';
import { MINI_GAME_CONFIG } from '../../config/GameConfig';

export class MemoryMatch {
  static createInitialState(): MemoryMatchState {
    'worklet';
    const config = MINI_GAME_CONFIG['memory-match'];
    const preyTypes = ['fish', 'mouse', 'butterfly', 'cockroach', 'ladybug', 'laser', 'bird', 'cricket'];
    const selectedTypes = preyTypes.slice(0, config.pairCount);

    const cards: MemoryMatchState['cards'] = [];
    selectedTypes.forEach((type, index) => {
      cards.push({
        id: `card-${index}-a`,
        preyType: type,
        isFlipped: false,
        isMatched: false,
      });
      cards.push({
        id: `card-${index}-b`,
        preyType: type,
        isFlipped: false,
        isMatched: false,
      });
    });

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return {
      type: 'memory-match',
      isActive: true,
      score: 0,
      timeRemaining: 0,
      highScore: 0,
      difficulty: 1,
      currentRound: 1,
      cards,
      flippedCards: [],
      moveCount: 0,
    };
  }

  static handleCardFlip(state: MemoryMatchState, cardId: string): MemoryMatchState {
    'worklet';
    const config = MINI_GAME_CONFIG['memory-match'];

    const card = state.cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || state.flippedCards.length >= 2) {
      return state;
    }

    const updatedCards = state.cards.map((c) =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );

    const newFlippedCards = [...state.flippedCards, cardId];

    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards;
      const firstCard = updatedCards.find((c) => c.id === firstId);
      const secondCard = updatedCards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.preyType === secondCard.preyType) {
        const matchedCards = updatedCards.map((c) =>
          c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
        );

        const matchedCount = matchedCards.filter((c) => c.isMatched).length / 2;
        const baseScore = 100;
        const movePenalty = state.moveCount * config.timePenalty;
        const finalScore = Math.max(0, baseScore * matchedCount - movePenalty);

        const allMatched = matchedCards.every((c) => c.isMatched);

        return {
          ...state,
          cards: matchedCards,
          flippedCards: [],
          moveCount: state.moveCount + 1,
          score: finalScore,
          isActive: !allMatched,
        };
      }

      return {
        ...state,
        cards: updatedCards,
        flippedCards: newFlippedCards,
        moveCount: state.moveCount + 1,
      };
    }

    return {
      ...state,
      cards: updatedCards,
      flippedCards: newFlippedCards,
    };
  }

  static resetFlippedCards(state: MemoryMatchState): MemoryMatchState {
    'worklet';
    if (state.flippedCards.length !== 2) {
      return state;
    }

    const updatedCards = state.cards.map((c) =>
      state.flippedCards.includes(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c
    );

    return {
      ...state,
      cards: updatedCards,
      flippedCards: [],
    };
  }
}
