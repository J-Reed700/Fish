import React from 'react';
import { Canvas, Circle, Rect, RoundedRect, Group } from '@shopify/react-native-skia';
import type {
  MiniGameState,
  WhackAMoleState,
  MemoryMatchState,
  FollowLeaderState,
  BubblePopState,
} from '../../types';

interface MiniGameRendererProps {
  state: MiniGameState;
  width: number;
  height: number;
}

export const MiniGameRenderer: React.FC<MiniGameRendererProps> = ({ state, width, height }) => {
  const renderWhackAMole = (whackState: WhackAMoleState) => {
    return whackState.holes.map((hole, index) => {
      const holeSize = 60;

      return (
        <Group key={`hole-${index}`}>
          <Circle
            cx={hole.position.x}
            cy={hole.position.y}
            r={holeSize / 2}
            color="rgba(50, 50, 50, 0.8)"
          />

          {hole.isVisible && hole.entity && (
            <Circle
              cx={hole.position.x}
              cy={hole.position.y}
              r={hole.entity.size / 2}
              color={hole.entity.color}
            />
          )}
        </Group>
      );
    });
  };

  const renderMemoryMatch = (memoryState: MemoryMatchState) => {
    const cardSize = 80;
    const gap = 10;
    const gridSize = 4;
    const totalWidth = gridSize * cardSize + (gridSize - 1) * gap;
    const totalHeight = gridSize * cardSize + (gridSize - 1) * gap;
    const startX = (width - totalWidth) / 2;
    const startY = (height - totalHeight) / 2;

    return memoryState.cards.map((card, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = startX + col * (cardSize + gap);
      const y = startY + row * (cardSize + gap);

      const getCardColor = () => {
        if (card.isMatched) return '#4CAF50';
        if (card.isFlipped) {
          switch (card.preyType) {
            case 'fish': return '#0080FF';
            case 'mouse': return '#888';
            case 'butterfly': return '#FF69B4';
            case 'cockroach': return '#3D2817';
            case 'ladybug': return '#FF0000';
            case 'laser': return '#FF0000';
            case 'bird': return '#87CEEB';
            case 'cricket': return '#228B22';
            default: return '#888';
          }
        }
        return '#666';
      };

      return (
        <Group key={card.id}>
          <RoundedRect
            x={x}
            y={y}
            width={cardSize}
            height={cardSize}
            r={8}
            color={getCardColor()}
          />
        </Group>
      );
    });
  };

  const renderFollowLeader = (followState: FollowLeaderState) => {
    return (
      <>
        {followState.checkpoints.map((checkpoint) => {
          const isActive = checkpoint.order === followState.currentCheckpoint;
          const color = checkpoint.completed
            ? '#4CAF50'
            : isActive
            ? '#FFD700'
            : '#888';

          return (
            <Group key={checkpoint.id}>
              <Circle
                cx={checkpoint.position.x}
                cy={checkpoint.position.y}
                r={40}
                color={color}
                opacity={0.6}
              />
              <Circle
                cx={checkpoint.position.x}
                cy={checkpoint.position.y}
                r={30}
                color={color}
                opacity={0.8}
              />
            </Group>
          );
        })}

        {followState.leaderFish && (
          <Circle
            cx={followState.leaderFish.position.x}
            cy={followState.leaderFish.position.y}
            r={followState.leaderFish.size / 2}
            color={followState.leaderFish.color}
          />
        )}
      </>
    );
  };

  const renderBubblePop = (bubbleState: BubblePopState) => {
    return bubbleState.bubbles.map((bubble) => {
      let color = '#00BFFF';
      if (bubble.type === 'golden') color = '#FFD700';
      if (bubble.type === 'bomb') color = '#FF3333';

      return (
        <Circle
          key={bubble.id}
          cx={bubble.position.x}
          cy={bubble.position.y}
          r={bubble.size / 2}
          color={color}
          opacity={0.7}
        />
      );
    });
  };

  const renderGameContent = () => {
    switch (state.type) {
      case 'whack-a-mole':
        return renderWhackAMole(state as WhackAMoleState);
      case 'memory-match':
        return renderMemoryMatch(state as MemoryMatchState);
      case 'follow-leader':
        return renderFollowLeader(state as FollowLeaderState);
      case 'bubble-pop':
        return renderBubblePop(state as BubblePopState);
      case 'speed-run':
        return null;
      default:
        return null;
    }
  };

  return (
    <Canvas style={{ position: 'absolute', width, height }}>
      {renderGameContent()}
    </Canvas>
  );
};
