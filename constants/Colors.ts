/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0B1220';
const tintColorDark = '#fff';


const brand = {
  purple: '#7C3AED',
  purpleDark: '#5B21B6',
  pink: '#EC4899',
  slate: '#0B1220',
  slateLight: '#1F2937',
  white: '#FFFFFF',
  gray: '#9CA3AF',
};

export const Colors = {
  light: {
    text: '#0B1220',
    background: '#FFFFFF',
    tint: brand.purple,
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: brand.purple,
    card: '#F8FAFC',
    border: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    background: brand.slate,
    tint: '#FFFFFF',
    icon: '#CBD5E1',
    tabIconDefault: '#CBD5E1',
    tabIconSelected: '#FFFFFF',
    card: '#111827',
    border: '#1F2937',
  },
};
