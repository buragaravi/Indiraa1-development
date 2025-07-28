// Comprehensive color system matching Tailwind config and all codebase usage
export const colors = {
  // Primary Green Theme (Main Brand Colors)
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
  
  // Secondary Green Variants
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

  // Direct Brand Colors (for hex replacement)
  brand: {
    greenMain: '#2ecc71',    // Most used green in components
    greenHover: '#27ae60',   // Hover states
    greenSoft: '#f8faf8',    // Background soft
  },

  // Status Colors (Complete Palettes)
  success: {
    50: '#e8f5e9',
    100: '#c8e6c8',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
    main: '#388e3c',
    light: '#4caf50',
    dark: '#2e7d32',
  },

  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },

  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
    main: '#ffa000',
    light: '#ffb74d',
    dark: '#f57c00',
  },

  info: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
    main: '#2196f3',
  },

  // Extended Colors Found in Codebase
  blue: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },

  red: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },

  yellow: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },

  orange: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800',
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },

  purple: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },

  pink: {
    50: '#fce4ec',
    100: '#f8bbd9',
    200: '#f48fb1',
    300: '#f06292',
    400: '#ec407a',
    500: '#e91e63',
    600: '#d81b60',
    700: '#c2185b',
    800: '#ad1457',
    900: '#880e4f',
  },

  indigo: {
    50: '#e8eaf6',
    100: '#c5cae9',
    200: '#9fa8da',
    300: '#7986cb',
    400: '#5c6bc0',
    500: '#3f51b5',
    600: '#3949ab',
    700: '#303f9f',
    800: '#283593',
    900: '#1a237e',
  },

  cyan: {
    50: '#e0f2f1',
    100: '#b2dfdb',
    200: '#80cbc4',
    300: '#4db6ac',
    400: '#26a69a',
    500: '#009688',
    600: '#00897b',
    700: '#00796b',
    800: '#00695c',
    900: '#004d40',
  },

  amber: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },

  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Background Colors
  background: {
    default: '#ffffff',
    paper: '#f5f5f5',
    soft: '#f8faf8',
    gray: '#fafafa',
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    light: '#bdbdbd',
    disabled: '#e0e0e0',
  },

  // Gray Scale
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Utility functions for consistent color usage
  getPrimary: (shade = 800) => colors.primary[shade] || colors.primary.main,
  getSecondary: (shade = 'main') => colors.secondary[shade] || colors.secondary.main,
  getStatus: (type = 'success', shade = 'main') => colors[type]?.[shade] || colors[type]?.main,
  getBrand: (variant = 'greenMain') => colors.brand[variant],

  // Status helper functions
  status: {
    pending: {
      bg: '#fff8e1',      // yellow-50
      text: '#f57c00',    // yellow-700
      border: '#ffcc02',  // yellow-300
    },
    processing: {
      bg: '#e3f2fd',      // blue-50
      text: '#1976d2',    // blue-700
      border: '#90caf9',  // blue-200
    },
    shipped: {
      bg: '#e3f2fd',      // blue-50
      text: '#1976d2',    // blue-700
      border: '#90caf9',  // blue-200
    },
    delivered: {
      bg: '#e8f5e9',      // green-50
      text: '#388e3c',    // green-700
      border: '#a5d6a7',  // green-200
    },
    cancelled: {
      bg: '#ffebee',      // red-50
      text: '#d32f2f',    // red-700
      border: '#ef9a9a',  // red-200
    },
    completed: {
      bg: '#e8f5e9',      // green-50
      text: '#388e3c',    // green-700
      border: '#a5d6a7',  // green-200
    },
  },
};
