export const WinterWonderland = {
  id: 'winter-wonderland',
  name: 'Winter Wonderland',
  description: 'A magical snowy landscape with northern lights',
  theme: 'christmas',
  config: {
    backgroundColor: '#1A3A52',
    backgroundGradient: ['#1A3A52', '#2A5A7A', '#1A3A52'],
    lighting: {
      ambient: 0.7,
      shadows: false,
      moonlight: true,
    },
    weather: {
      snow: {
        enabled: true,
        intensity: 0.7,
        flakeSize: 'medium',
        windSpeed: 0.3,
      },
    },
    decorations: [
      {
        type: 'pine-trees',
        count: 12,
        snow: true,
        placement: 'background',
      },
      {
        type: 'presents',
        count: 8,
        colors: ['red', 'green', 'gold'],
        placement: 'ground',
      },
      {
        type: 'icicles',
        positions: 'top',
        animated: true,
      },
    ],
    particles: [
      {
        type: 'snowfall',
        count: 100,
        speed: 1.0,
        size: 'varied',
      },
      {
        type: 'northern-lights',
        colors: ['#00FF00', '#0088FF', '#FF00FF'],
        intensity: 0.6,
        animated: true,
      },
      {
        type: 'sparkles',
        count: 30,
        color: '#FFFFFF',
      },
    ],
    audio: {
      ambient: 'winter-wind',
      volume: 0.5,
      loops: true,
    },
  },
  unlockRequirement: {
    event: 'christmas',
  },
};
