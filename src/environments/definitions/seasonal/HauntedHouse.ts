export const HauntedHouse = {
  id: 'haunted-house',
  name: 'Haunted House',
  description: 'A spooky mansion filled with cobwebs and candles',
  theme: 'halloween',
  config: {
    backgroundColor: '#1A0033',
    backgroundGradient: ['#1A0033', '#2D0052', '#1A0033'],
    lighting: {
      ambient: 0.3,
      shadows: true,
      flickering: true,
    },
    weather: {
      fog: {
        enabled: true,
        density: 0.6,
        color: '#9999AA',
        speed: 0.1,
      },
    },
    decorations: [
      {
        type: 'cobwebs',
        positions: 'corners',
        opacity: 0.7,
      },
      {
        type: 'candles',
        count: 8,
        flickering: true,
        color: '#FFA500',
      },
      {
        type: 'tombstones',
        count: 5,
        placement: 'scattered',
      },
    ],
    particles: [
      {
        type: 'bats',
        count: 15,
        speed: 2.0,
        size: 'small',
      },
      {
        type: 'ghost-wisps',
        count: 10,
        speed: 0.5,
        opacity: 0.4,
      },
    ],
    audio: {
      ambient: 'haunted-mansion',
      volume: 0.6,
      loops: true,
    },
  },
  unlockRequirement: {
    event: 'halloween',
  },
};
