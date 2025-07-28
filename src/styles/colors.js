// Updated colors to match Tailwind config
export const colors = {
  primary: {
    50: '#e8f5e8',
    100: '#c8e6c8',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32', // main/DEFAULT
    900: '#1b5e20',
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
  secondary: {
    50: '#f1f8e9',
    100: '#dcedc8',
    200: '#c5e1a5',
    300: '#aed581',
    400: '#9ccc65',
    500: '#8bc34a',
    600: '#7cb342',
    700: '#689f38',
    800: '#558b2f',
    900: '#33691e',
    main: '#81c784',
    light: '#a5d6a7',
    dark: '#66bb6a',
  },
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
    soft: '#f8faf8',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    light: '#bdbdbd',
  },
  success: '#388e3c',
  error: '#d32f2f',
  warning: '#ffa000',
  
  // Utility functions for consistent color usage
  getPrimary: (shade = 800) => colors.primary[shade] || colors.primary.main,
  getSecondary: (shade = 'main') => colors.secondary[shade] || colors.secondary.main,
};
