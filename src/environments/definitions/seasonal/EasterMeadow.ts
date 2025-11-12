export const EasterMeadow = {
  id: 'easter-meadow',
  name: 'Easter Meadow',
  description: 'A cheerful meadow with hidden Easter eggs',
  theme: 'easter',
  config: {
    backgroundColor: '#E6F7E6',
    backgroundGradient: ['#E6F7FF', '#E6F7E6', '#FFFACD'],
    lighting: {
      ambient: 0.9,
      shadows: false,
      sunny: true,
    },
    weather: {
      clear: true,
      temperature: 'mild',
    },
    decorations: [
      {
        type: 'easter-eggs',
        count: 20,
        colors: ['pastel-rainbow'],
        placement: 'hidden',
        interactive: true,
      },
      {
        type: 'grass',
        density: 'high',
        color: '#90EE90',
        height: 'medium',
      },
      {
        type: 'flowers',
        count: 30,
        types: ['tulips', 'daisies'],
        colors: ['#FFB6C1', '#87CEEB', '#FFD700'],
      },
      {
        type: 'bunny-decorations',
        count: 5,
        placement: 'scattered',
      },
    ],
    particles: [
      {
        type: 'butterflies',
        count: 15,
        colors: ['pastel'],
        speed: 1.2,
      },
      {
        type: 'floating-eggs',
        count: 10,
        colors: ['#FFB6C1', '#87CEEB', '#FFD700'],
        bobbing: true,
      },
      {
        type: 'flower-petals',
        count: 25,
        colors: ['#FFB6C1', '#FFFFE0'],
        drift: true,
      },
    ],
    audio: {
      ambient: 'spring-birds',
      volume: 0.7,
      loops: true,
    },
  },
  unlockRequirement: {
    event: 'easter',
  },
};
