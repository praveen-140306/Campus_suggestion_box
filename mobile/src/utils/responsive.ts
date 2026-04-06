import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (designed for a 375x812 screen)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Scale based on screen width
export const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;

// Scale based on screen height
export const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

// Moderate scale (between fixed and full scale) — good for fonts
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Font scale — respects device font settings
export const fontScale = (size: number) => {
  const scaledSize = moderateScale(size);
  return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
};

// Spacing helpers
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Screen dimensions export
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmall: SCREEN_WIDTH < 360,
  isMedium: SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 414,
  isLarge: SCREEN_WIDTH >= 414,
};

// Border radius helpers
export const radius = {
  sm: scale(8),
  md: scale(14),
  lg: scale(20),
  xl: scale(28),
  full: 999,
};
