export const RoseGarden = {
  id: 'rose-garden',
  name: 'Rose Garden',
  description: 'A romantic garden filled with roses and hearts',
  theme: 'valentines',
  config: {
    backgroundColor: '#FFF0F5',
    backgroundGradient: ['#FFF0F5', '#FFE4E1', '#FFF0F5'],
    lighting: {
      ambient: 0.9,
      shadows: false,
      softGlow: true,
    },
    weather: {
      clear: true,
    },
    decorations: [
      {
        type: 'rose-bushes',
        count: 15,
        colors: ['#FF1493', '#FF69B4', '#FFC0CB'],
        placement: 'scattered',
      },
      {
        type: 'heart-archway',
        position: 'center-back',
        size: 'large',
      },
      {
        type: 'garden-path',
        pattern: 'hearts',
        color: '#FFB6C1',
      },
    ],
    particles: [
      {
        type: 'hearts',
        count: 25,
        speed: 0.8,
        colors: ['#FF69B4', '#FF1493'],
        float: true,
      },
      {
        type: 'rose-petals',
        count: 40,
        speed: 0.5,
        colors: ['#FF69B4', '#FFC0CB'],
        drift: true,
      },
      {
        type: 'sparkles',
        count: 20,
        color: '#FFD700',
      },
    ],
    audio: {
      ambient: 'romantic-melody',
      volume: 0.6,
      loops: true,
    },
  },
  unlockRequirement: {
    event: 'valentines',
  },
};
