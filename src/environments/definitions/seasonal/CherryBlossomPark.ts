export const CherryBlossomPark = {
  id: 'cherry-blossom-park',
  name: 'Cherry Blossom Park',
  description: 'A serene park with blooming cherry trees',
  theme: 'spring',
  config: {
    backgroundColor: '#E6F7FF',
    backgroundGradient: ['#E6F7FF', '#FFE4E1', '#E6F7E6'],
    lighting: {
      ambient: 0.9,
      shadows: false,
      softLight: true,
    },
    weather: {
      clear: true,
      temperature: 'mild',
      breeze: {
        enabled: true,
        speed: 0.5,
        gentle: true,
      },
    },
    decorations: [
      {
        type: 'cherry-trees',
        count: 8,
        bloom: 'full',
        colors: ['#FFB7C5', '#FFC0CB'],
        placement: 'scattered',
        swaying: true,
      },
      {
        type: 'park-bench',
        count: 3,
        placement: 'ground',
      },
      {
        type: 'grass',
        density: 'high',
        color: '#90EE90',
        flowers: true,
      },
      {
        type: 'pond',
        position: 'center-bottom',
        ripples: true,
        koi: true,
      },
    ],
    particles: [
      {
        type: 'cherry-petals',
        count: 80,
        colors: ['#FFB7C5', '#FFC0CB', '#FFFFFF'],
        speed: 0.6,
        drifting: true,
        swirling: true,
      },
      {
        type: 'butterflies',
        count: 20,
        colors: ['pastel'],
        speed: 1.0,
      },
      {
        type: 'pollen',
        count: 30,
        color: '#FFD700',
        floating: true,
      },
    ],
    audio: {
      ambient: 'spring-breeze',
      volume: 0.6,
      loops: true,
      secondary: 'birds-chirping',
    },
  },
  unlockRequirement: {
    event: 'spring',
  },
};
