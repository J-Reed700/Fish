import type { BubblePopState, Vector2D } from '../../types';
import { MINI_GAME_CONFIG } from '../../config/GameConfig';

export class BubblePop {
  static createInitialState(bounds: { width: number; height: number }): BubblePopState {
    'worklet';
    const config = MINI_GAME_CONFIG['bubble-pop'];
    const bubbles = this.generateBubbles(config.bubbleCount, bounds);

    return {
      type: 'bubble-pop',
      isActive: true,
      score: 0,
      timeRemaining: config.duration,
      highScore: 0,
      difficulty: 1,
      currentRound: 1,
      bubbles,
      comboMultiplier: 1,
      lastPopTime: 0,
    };
  }

  private static generateBubbles(
    count: number,
    bounds: { width: number; height: number }
  ): BubblePopState['bubbles'] {
    'worklet';
    const bubbles: BubblePopState['bubbles'] = [];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * bounds.width;
      const y = bounds.height + Math.random() * 200;

      let type: 'normal' | 'golden' | 'bomb' = 'normal';
      const rand = Math.random();
      if (rand < 0.1) {
        type = 'golden';
      } else if (rand < 0.2) {
        type = 'bomb';
      }

      bubbles.push({
        id: `bubble-${i}-${Date.now()}`,
        position: { x, y },
        velocity: {
          x: (Math.random() - 0.5) * 20,
          y: -(50 + Math.random() * 50),
        },
        type,
        size: 30 + Math.random() * 20,
      });
    }

    return bubbles;
  }

  static update(
    state: BubblePopState,
    deltaTime: number,
    bounds: { width: number; height: number }
  ): BubblePopState {
    'worklet';
    const config = MINI_GAME_CONFIG['bubble-pop'];
    const now = Date.now();

    const newTimeRemaining = Math.max(0, state.timeRemaining - deltaTime * 1000);

    const updatedBubbles = state.bubbles
      .map((bubble) => {
        const newY = bubble.position.y + bubble.velocity.y * deltaTime;
        const newX = bubble.position.x + bubble.velocity.x * deltaTime;

        return {
          ...bubble,
          position: { x: newX, y: newY },
        };
      })
      .filter((bubble) => bubble.position.y > -100);

    const shouldSpawn = updatedBubbles.length < config.bubbleCount && Math.random() < 0.05;
    if (shouldSpawn) {
      updatedBubbles.push(...this.generateBubbles(3, bounds));
    }

    const comboExpired = now - state.lastPopTime > config.comboWindow;
    const newComboMultiplier = comboExpired ? 1 : state.comboMultiplier;

    return {
      ...state,
      timeRemaining: newTimeRemaining,
      isActive: newTimeRemaining > 0,
      bubbles: updatedBubbles,
      comboMultiplier: newComboMultiplier,
    };
  }

  static handleTouch(
    state: BubblePopState,
    touchPoint: Vector2D
  ): BubblePopState {
    'worklet';
    const config = MINI_GAME_CONFIG['bubble-pop'];
    const now = Date.now();

    let hitIndex = -1;
    for (let i = 0; i < state.bubbles.length; i++) {
      const bubble = state.bubbles[i];
      const dx = bubble.position.x - touchPoint.x;
      const dy = bubble.position.y - touchPoint.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < bubble.size) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex === -1) {
      return state;
    }

    const hitBubble = state.bubbles[hitIndex];
    const updatedBubbles = state.bubbles.filter((_, i) => i !== hitIndex);

    let scoreChange = 0;
    let newComboMultiplier = state.comboMultiplier;

    switch (hitBubble.type) {
      case 'normal':
        scoreChange = config.normalScore * newComboMultiplier;
        newComboMultiplier = Math.min(
          config.comboMultipliers[config.comboMultipliers.length - 1],
          newComboMultiplier + 1
        );
        break;
      case 'golden':
        scoreChange = config.goldenScore * newComboMultiplier;
        newComboMultiplier = Math.min(
          config.comboMultipliers[config.comboMultipliers.length - 1],
          newComboMultiplier + 2
        );
        break;
      case 'bomb':
        scoreChange = -config.bombPenalty;
        newComboMultiplier = 1;
        break;
    }

    return {
      ...state,
      bubbles: updatedBubbles,
      score: Math.max(0, state.score + scoreChange),
      comboMultiplier: newComboMultiplier,
      lastPopTime: now,
    };
  }
}
