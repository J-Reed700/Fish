export const HarvestFestival = {
  id: 'harvest-festival',
  name: 'Harvest Festival',
  description: 'An autumn pumpkin patch with falling leaves',
  theme: 'autumn',
  config: {
    backgroundColor: '#2F1B0C',
    backgroundGradient: ['#8B4513', '#D2691E', '#2F1B0C'],
    lighting: {
      ambient: 0.6,
      shadows: true,
      goldenHour: true,
    },
    weather: {
      clear: true,
      temperature: 'cool',
      wind: {
        enabled: true,
        speed: 0.8,
        gusts: true,
      },
    },
    decorations: [
      {
        type: 'pumpkins',
        count: 15,
        sizes: ['small', 'medium', 'large'],
        placement: 'ground',
        carved: 'some',
      },
      {
        type: 'corn-stalks',
        count: 10,
        placement: 'background',
        height: 'tall',
      },
      {
        type: 'hay-bales',
        count: 8,
        placement: 'scattered',
      },
      {
        type: 'scarecrow',
        count: 2,
        placement: 'background',
      },
      {
        type: 'autumn-trees',
        count: 6,
        leafColors: ['#FF8C00', '#DC143C', '#FFD700'],
      },
    ],
    particles: [
      {
        type: 'falling-leaves',
        count: 50,
        colors: ['#FF8C00', '#8B4513', '#FFD700', '#DC143C'],
        speed: 1.2,
        drifting: true,
      },
      {
        type: 'wind-gusts',
        count: 10,
        opacity: 0.3,
      },
      {
        type: 'acorns',
        count: 15,
        falling: true,
      },
    ],
    audio: {
      ambient: 'autumn-wind',
      volume: 0.6,
      loops: true,
    },
  },
  unlockRequirement: {
    event: 'autumn',
  },
};
