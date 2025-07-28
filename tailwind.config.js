/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: (() => {
    const colors = [
      // Core brand colors
      '2ecc71', '27ae60', 'f8faf8',
      // Tailwind palette references (greens, purples, reds, etc.)
      'green-50','green-100','green-500','green-600','green-700','green-800','green-900',
      'purple-50','purple-100','purple-500','purple-600','purple-700',
      'red-50','red-100','red-500','red-600','red-700',
      'orange-50','orange-100','orange-500','orange-600','orange-700',
      'blue-50','blue-100','blue-500','blue-600','blue-700',
      'yellow-100','yellow-400','yellow-500','yellow-600','yellow-700',
      'amber-50','amber-200','amber-500','amber-600','amber-700',
      'emerald-50','emerald-200','emerald-500','emerald-600',
      'indigo-50','indigo-200','indigo-700',
      'teal-50','teal-200','teal-700',
      'cyan-50','cyan-200','cyan-700',
      'gray-50','gray-100','gray-200','gray-300','gray-400','gray-500','gray-600','gray-700','gray-800','gray-900'
    ];

    const prefixes = [
      'bg', 'text', 'border', 'hover:bg', 'hover:text',
      'hover:border', 'focus:ring', 'shadow', 'hover:shadow',
      'from', 'to'
    ];

    const opacity = ['','/5','/10','/20','/25','/40','/50','/70','/80','/90'];

    let list = [];

    // Base colors + opacity
    colors.forEach(color => {
      prefixes.forEach(prefix => {
        opacity.forEach(op => {
          list.push(`${prefix}-${color}${op}`);
        });
      });
    });

    // Gradients and blur utilities
    list.push(
      'bg-gradient-to-r', 'bg-gradient-to-l', 'bg-gradient-to-b', 'bg-gradient-to-t', 'bg-gradient-to-br',
      'hover:from-2ecc71', 'hover:to-27ae60',
      'backdrop-blur-sm','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl','bg-white/80','bg-white/90',
      'shadow-lg','shadow-md','shadow-sm','hover:shadow-lg',
      'transition-all','transition-colors','duration-200','duration-300','animate-spin'
    );

    return list;
  })(),
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5e8',
          100: '#c8e6c8',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
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
        brand: {
          'green-main': '#2ecc71',
          'green-hover': '#27ae60',
          'green-soft': '#f8faf8',
          DEFAULT: '#2ecc71',
          50: '#e8f8f1',
          100: '#c8eede',
          200: '#91dbb8',
          300: '#5ac892',
          400: '#23b56c',
          500: '#2ecc71',
          600: '#27ae60',
          700: '#229954',
          800: '#1d7a44',
          900: '#185d33',
        },
        success: { DEFAULT: '#388e3c' },
        error: { DEFAULT: '#d32f2f' },
        warning: { DEFAULT: '#ffa000' },
        info: { DEFAULT: '#2196f3' },
        // ... keep other full palettes from your original config
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
