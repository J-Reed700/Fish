export const BeachParadise = {
  id: 'beach-paradise',
  name: 'Beach Paradise',
  description: 'A sunny tropical beach with ocean waves',
  theme: 'summer',
  config: {
    backgroundColor: '#87CEEB',
    backgroundGradient: ['#87CEEB', '#00BFFF', '#F5DEB3'],
    lighting: {
      ambient: 1.0,
      shadows: true,
      sunlight: {
        enabled: true,
        intensity: 0.9,
        position: 'top-right',
      },
    },
    weather: {
      clear: true,
      temperature: 'hot',
      humidity: 'high',
    },
    decorations: [
      {
        type: 'sand',
        texture: 'beach-sand',
        color: '#F5DEB3',
        coverage: 'bottom-third',
      },
      {
        type: 'ocean-waves',
        animated: true,
        speed: 1.0,
        color: '#00BFFF',
      },
      {
        type: 'beach-umbrella',
        count: 3,
        colors: ['#FF6347', '#FFD700', '#00BFFF'],
        placement: 'sand',
      },
      {
        type: 'palm-trees',
        count: 4,
        placement: 'sides',
        swaying: true,
      },
      {
        type: 'beach-ball',
        count: 2,
        bouncing: true,
      },
    ],
    particles: [
      {
        type: 'seagulls',
        count: 8,
        speed: 1.5,
        animated: true,
      },
      {
        type: 'waves-splash',
        count: 15,
        placement: 'water-edge',
      },
      {
        type: 'sand-sparkles',
        count: 30,
        color: '#FFD700',
      },
      {
        type: 'bubbles',
        count: 20,
        rising: true,
      },
    ],
    audio: {
      ambient: 'ocean-waves',
      volume: 0.7,
      loops: true,
      secondary: 'seagulls',
    },
  },
  unlockRequirement: {
    event: 'summer',
  },
};
