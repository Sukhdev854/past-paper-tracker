export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    cardBg: string;
    cardText: string;
  };
  font: string;
  effects: {
    glow: boolean;
    animations: boolean;
    shadows: boolean;
    borders: string;
  };
  chartColors: string[];
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    displayName: 'Default',
    description: 'Clean and modern gradient design',
    colors: {
      primary: 'indigo',
      secondary: 'purple',
      accent: 'pink',
      background: 'gradient-to-br from-indigo-50 via-white to-purple-50',
      text: 'gray-900',
      cardBg: 'white',
      cardText: 'gray-900',
    },
    font: 'system',
    effects: {
      glow: false,
      animations: true,
      shadows: true,
      borders: 'rounded',
    },
    chartColors: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
  },
  neonGlow: {
    name: 'neonGlow',
    displayName: 'Neon Glow',
    description: 'Vibrant neon colors with glowing effects',
    colors: {
      primary: 'cyan',
      secondary: 'fuchsia',
      accent: 'lime',
      background: 'gray-950',
      text: 'cyan-400',
      cardBg: 'gray-900',
      cardText: 'white',
    },
    font: 'system',
    effects: {
      glow: true,
      animations: true,
      shadows: true,
      borders: 'rounded',
    },
    chartColors: ['#06b6d4', '#d946ef', '#84cc16', '#f59e0b', '#ec4899'],
  },
  static: {
    name: 'static',
    displayName: 'Static Minimal',
    description: 'Clean, minimal design with no animations',
    colors: {
      primary: 'slate',
      secondary: 'gray',
      accent: 'zinc',
      background: 'white',
      text: 'gray-900',
      cardBg: 'gray-50',
      cardText: 'gray-900',
    },
    font: 'system',
    effects: {
      glow: false,
      animations: false,
      shadows: false,
      borders: 'sharp',
    },
    chartColors: ['#64748b', '#6b7280', '#71717a', '#9ca3af', '#a1a1aa'],
  },
  typewriter: {
    name: 'typewriter',
    displayName: 'Typewriter',
    description: 'Retro typewriter aesthetic',
    colors: {
      primary: 'amber',
      secondary: 'yellow',
      accent: 'orange',
      background: 'amber-50',
      text: 'gray-900',
      cardBg: 'white',
      cardText: 'gray-900',
    },
    font: 'mono',
    effects: {
      glow: false,
      animations: true,
      shadows: false,
      borders: 'sharp',
    },
    chartColors: ['#f59e0b', '#eab308', '#fb923c', '#f97316', '#ea580c'],
  },
  cyberpunk: {
    name: 'cyberpunk',
    displayName: 'Cyberpunk',
    description: 'Futuristic cyberpunk vibes',
    colors: {
      primary: 'purple',
      secondary: 'pink',
      accent: 'cyan',
      background: 'gray-900',
      text: 'purple-400',
      cardBg: 'gray-800',
      cardText: 'white',
    },
    font: 'system',
    effects: {
      glow: true,
      animations: true,
      shadows: true,
      borders: 'rounded',
    },
    chartColors: ['#a855f7', '#ec4899', '#06b6d4', '#f59e0b', '#84cc16'],
  },
  pastel: {
    name: 'pastel',
    displayName: 'Pastel Dreams',
    description: 'Soft pastel colors for a gentle look',
    colors: {
      primary: 'rose',
      secondary: 'pink',
      accent: 'purple',
      background: 'gradient-to-br from-pink-100 via-purple-50 to-blue-100',
      text: 'gray-900',
      cardBg: 'white',
      cardText: 'gray-900',
    },
    font: 'rounded',
    effects: {
      glow: false,
      animations: true,
      shadows: true,
      borders: 'rounded',
    },
    chartColors: ['#f43f5e', '#ec4899', '#a855f7', '#8b5cf6', '#6366f1'],
  },
  dark: {
    name: 'dark',
    displayName: 'Dark Mode',
    description: 'Easy on the eyes dark theme',
    colors: {
      primary: 'blue',
      secondary: 'indigo',
      accent: 'violet',
      background: 'gray-950',
      text: 'blue-400',
      cardBg: 'gray-900',
      cardText: 'gray-100',
    },
    font: 'system',
    effects: {
      glow: false,
      animations: true,
      shadows: true,
      borders: 'rounded',
    },
    chartColors: ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#10b981'],
  },
};

export const FONT_OPTIONS = [
  { value: 'system', label: 'System', class: 'font-sans', import: '' },
  { value: 'mono', label: 'Monospace', class: 'font-mono', import: '' },
  { value: 'serif', label: 'Serif', class: 'font-serif', import: '' },
  { value: 'poppins', label: 'Poppins', class: 'font-poppins', import: 'Poppins:wght@300;400;500;600;700' },
  { value: 'inter', label: 'Inter', class: 'font-inter', import: 'Inter:wght@300;400;500;600;700' },
  { value: 'roboto', label: 'Roboto', class: 'font-roboto', import: 'Roboto:wght@300;400;500;700' },
  { value: 'opensans', label: 'Open Sans', class: 'font-opensans', import: 'Open+Sans:wght@300;400;600;700' },
  { value: 'montserrat', label: 'Montserrat', class: 'font-montserrat', import: 'Montserrat:wght@300;400;500;600;700' },
  { value: 'playfair', label: 'Playfair', class: 'font-playfair', import: 'Playfair+Display:wght@400;500;600;700' },
  { value: 'pacifico', label: 'Pacifico', class: 'font-pacifico', import: 'Pacifico' },
  { value: 'oswald', label: 'Oswald', class: 'font-oswald', import: 'Oswald:wght@300;400;500;600;700' },
  { value: 'merriweather', label: 'Merriweather', class: 'font-merriweather', import: 'Merriweather:wght@300;400;700' },
  { value: 'lato', label: 'Lato', class: 'font-lato', import: 'Lato:wght@300;400;700' },
  { value: 'raleway', label: 'Raleway', class: 'font-raleway', import: 'Raleway:wght@300;400;500;600;700' },
  { value: 'nunito', label: 'Nunito', class: 'font-nunito', import: 'Nunito:wght@300;400;600;700' },
];

export const COLOR_OPTIONS = [
  { value: 'indigo', label: 'Indigo', preview: 'bg-indigo-600' },
  { value: 'blue', label: 'Blue', preview: 'bg-blue-600' },
  { value: 'cyan', label: 'Cyan', preview: 'bg-cyan-600' },
  { value: 'teal', label: 'Teal', preview: 'bg-teal-600' },
  { value: 'green', label: 'Green', preview: 'bg-green-600' },
  { value: 'lime', label: 'Lime', preview: 'bg-lime-500' },
  { value: 'yellow', label: 'Yellow', preview: 'bg-yellow-500' },
  { value: 'amber', label: 'Amber', preview: 'bg-amber-600' },
  { value: 'orange', label: 'Orange', preview: 'bg-orange-600' },
  { value: 'red', label: 'Red', preview: 'bg-red-600' },
  { value: 'pink', label: 'Pink', preview: 'bg-pink-600' },
  { value: 'rose', label: 'Rose', preview: 'bg-rose-600' },
  { value: 'purple', label: 'Purple', preview: 'bg-purple-600' },
  { value: 'fuchsia', label: 'Fuchsia', preview: 'bg-fuchsia-600' },
  { value: 'violet', label: 'Violet', preview: 'bg-violet-600' },
  { value: 'gray', label: 'Gray', preview: 'bg-gray-600' },
  { value: 'slate', label: 'Slate', preview: 'bg-slate-600' },
  { value: 'zinc', label: 'Zinc', preview: 'bg-zinc-600' },
];

export const BACKGROUND_OPTIONS = [
  { value: 'white', label: 'White', preview: 'bg-white' },
  { value: 'gray-50', label: 'Light Gray', preview: 'bg-gray-50' },
  { value: 'gray-900', label: 'Dark Gray', preview: 'bg-gray-900' },
  { value: 'gray-950', label: 'Almost Black', preview: 'bg-gray-950' },
  { value: 'gradient-to-br from-indigo-50 via-white to-purple-50', label: 'Indigo-Purple Gradient', preview: 'bg-gradient-to-br from-indigo-50 via-white to-purple-50' },
  { value: 'gradient-to-br from-pink-100 via-purple-50 to-blue-100', label: 'Pastel Gradient', preview: 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100' },
  { value: 'gradient-to-br from-cyan-50 via-blue-50 to-indigo-100', label: 'Cool Gradient', preview: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100' },
  { value: 'amber-50', label: 'Warm Beige', preview: 'bg-amber-50' },
];

export function getThemeClasses(theme: ThemeConfig): string {
  const classes: string[] = [];
  
  if (theme.effects.glow) {
    classes.push('theme-glow');
  }
  
  if (!theme.effects.animations) {
    classes.push('theme-no-animations');
  }
  
  if (!theme.effects.shadows) {
    classes.push('theme-no-shadows');
  }
  
  if (theme.effects.borders === 'sharp') {
    classes.push('theme-sharp-borders');
  }
  
  const fontOption = FONT_OPTIONS.find(f => f.value === theme.font);
  if (fontOption) {
    classes.push(fontOption.class);
  }
  
  return classes.join(' ');
}