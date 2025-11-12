import { EnvironmentId } from '../../types';
import { WeatherType } from '../emitters/WeatherEmitter';

export interface EnvironmentEffectPreset {
  weather: WeatherType;
  weatherIntensity: 'light' | 'medium' | 'heavy';
  ambientColor: string;
  particleColor: string;
  lightRays: boolean;
  caustics: boolean;
  fog: boolean;
  backgroundGradient: [string, string];
  timeOfDay?: 'dawn' | 'day' | 'dusk' | 'night';
}

export const ENVIRONMENT_EFFECT_PRESETS: Record<
  EnvironmentId,
  EnvironmentEffectPreset
> = {
  ocean: {
    weather: 'clear',
    weatherIntensity: 'light',
    ambientColor: '#0277BD',
    particleColor: '#4FC3F7',
    lightRays: true,
    caustics: true,
    fog: false,
    backgroundGradient: ['#01579B', '#4FC3F7'],
  },
  pond: {
    weather: 'clear',
    weatherIntensity: 'light',
    ambientColor: '#00695C',
    particleColor: '#4DB6AC',
    lightRays: true,
    caustics: true,
    fog: false,
    backgroundGradient: ['#004D40', '#4DB6AC'],
  },
  garden: {
    weather: 'clear',
    weatherIntensity: 'light',
    ambientColor: '#558B2F',
    particleColor: '#9CCC65',
    lightRays: false,
    caustics: false,
    fog: false,
    backgroundGradient: ['#33691E', '#9CCC65'],
  },
  backyard: {
    weather: 'clear',
    weatherIntensity: 'light',
    ambientColor: '#F57C00',
    particleColor: '#FFB74D',
    lightRays: false,
    caustics: false,
    fog: false,
    backgroundGradient: ['#E65100', '#FFB74D'],
  },
  jungle: {
    weather: 'rain',
    weatherIntensity: 'medium',
    ambientColor: '#2E7D32',
    particleColor: '#66BB6A',
    lightRays: true,
    caustics: false,
    fog: true,
    backgroundGradient: ['#1B5E20', '#66BB6A'],
  },
  desert: {
    weather: 'clear',
    weatherIntensity: 'light',
    ambientColor: '#F57F17',
    particleColor: '#FFF176',
    lightRays: true,
    caustics: false,
    fog: false,
    backgroundGradient: ['#F57F17', '#FFF9C4'],
    timeOfDay: 'day',
  },
};

export const getEnvironmentEffect = (
  environmentId: EnvironmentId
): EnvironmentEffectPreset => {
  return (
    ENVIRONMENT_EFFECT_PRESETS[environmentId] ||
    ENVIRONMENT_EFFECT_PRESETS.ocean
  );
};

export const getTimeOfDayEffect = (
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
): {
  colorGrade: string;
  ambientLight: number;
  particleAlpha: number;
} => {
  switch (timeOfDay) {
    case 'dawn':
      return {
        colorGrade: 'warm',
        ambientLight: 0.7,
        particleAlpha: 0.8,
      };
    case 'day':
      return {
        colorGrade: 'vibrant',
        ambientLight: 1.0,
        particleAlpha: 1.0,
      };
    case 'dusk':
      return {
        colorGrade: 'warm',
        ambientLight: 0.6,
        particleAlpha: 0.7,
      };
    case 'night':
      return {
        colorGrade: 'cool',
        ambientLight: 0.4,
        particleAlpha: 0.5,
      };
  }
};

export const getSeasonalEffect = (
  season: 'spring' | 'summer' | 'autumn' | 'winter'
): {
  weather: WeatherType;
  colorGrade: string;
  particleType: string;
} => {
  switch (season) {
    case 'spring':
      return {
        weather: 'leaves',
        colorGrade: 'vibrant',
        particleType: 'petals',
      };
    case 'summer':
      return {
        weather: 'clear',
        colorGrade: 'vibrant',
        particleType: 'fireflies',
      };
    case 'autumn':
      return {
        weather: 'leaves',
        colorGrade: 'warm',
        particleType: 'leaves',
      };
    case 'winter':
      return {
        weather: 'snow',
        colorGrade: 'cool',
        particleType: 'snow',
      };
  }
};
