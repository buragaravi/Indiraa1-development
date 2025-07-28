/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5e8',
          100: '#c8e6c8',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50', // main
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32', // DEFAULT
          900: '#1b5e20', // dark
          DEFAULT: '#2e7d32',
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
          DEFAULT: '#81c784',
          light: '#a5d6a7',
          dark: '#66bb6a',
        },
        success: {
          DEFAULT: '#388e3c',
          light: '#4caf50',
          dark: '#2e7d32',
        },
        error: {
          DEFAULT: '#d32f2f',
          light: '#ef5350',
          dark: '#c62828',
        },
        warning: {
          DEFAULT: '#ffa000',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        background: {
          DEFAULT: '#ffffff',
          paper: '#f5f5f5',
          soft: '#f8faf8',
        },
        text: {
          primary: '#212121',
          secondary: '#757575',
          light: '#bdbdbd',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
