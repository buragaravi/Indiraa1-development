/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: (() => {
    const hexColors = ['2ecc71', '27ae60', 'f8faf8'];

    const namedColors = [
      'primary','secondary','brand','success','error','warning','info',
      'amber','orange','purple','pink','indigo','cyan','emerald','gray',
      'green','red','blue','yellow','teal'
    ];

    const colorShades = ['50','100','200','300','400','500','600','700','800','900'];

    const prefixes = [
      'bg','text','border','hover:bg','hover:text','hover:border',
      'focus:ring','shadow','hover:shadow','from','to'
    ];

    const opacities = ['','/5','/10','/20','/25','/40','/50','/70','/80','/90'];

    let list = [];

    // Generate safelist for hex colors
    hexColors.forEach(hex => {
      prefixes.forEach(prefix => {
        opacities.forEach(op => {
          list.push(`${prefix}-[${hex}]${op}`);
        });
      });
    });

    // Generate safelist for named colors with shades
    namedColors.forEach(color => {
      prefixes.forEach(prefix => {
        colorShades.forEach(shade => {
          opacities.forEach(op => {
            list.push(`${prefix}-${color}-${shade}${op}`);
          });
        });
      });
    });

    // Add gradients and utility classes
    list.push(
      'bg-gradient-to-r','bg-gradient-to-l','bg-gradient-to-b','bg-gradient-to-t','bg-gradient-to-br',
      'hover:from-2ecc71','hover:to-27ae60',
      'backdrop-blur-sm','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl',
      'bg-white/80','bg-white/90','bg-white/95','bg-black/20',
      'shadow-lg','shadow-md','shadow-sm','hover:shadow-lg',
      'transition-all','transition-colors','duration-200','duration-300','animate-spin'
    );

    return list;
  })(),
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8f5e8', 100: '#c8e6c8', 200: '#a5d6a7', 300: '#81c784', 400: '#66bb6a',
          500: '#4caf50', 600: '#43a047', 700: '#388e3c', 800: '#2e7d32', 900: '#1b5e20',
          DEFAULT: '#2e7d32', light: '#4caf50', dark: '#1b5e20',
        },
        secondary: {
          50: '#f1f8e9', 100: '#dcedc8', 200: '#c5e1a5', 300: '#aed581', 400: '#9ccc65',
          500: '#8bc34a', 600: '#7cb342', 700: '#689f38', 800: '#558b2f', 900: '#33691e',
          DEFAULT: '#81c784', light: '#a5d6a7', dark: '#66bb6a',
        },
        brand: {
          'green-main': '#2ecc71','green-hover': '#27ae60','green-soft': '#f8faf8',
          DEFAULT: '#2ecc71',
          50: '#e8f8f1',100: '#c8eede',200: '#91dbb8',300: '#5ac892',400: '#23b56c',
          500: '#2ecc71',600: '#27ae60',700: '#229954',800: '#1d7a44',900: '#185d33',
        },
        success: {
          50: '#e8f5e9',100: '#c8e6c8',200: '#a5d6a7',300: '#81c784',400: '#66bb6a',
          500: '#4caf50',600: '#43a047',700: '#388e3c',800: '#2e7d32',900: '#1b5e20',
          DEFAULT: '#388e3c',light: '#4caf50',dark: '#2e7d32',
        },
        error: {
          50: '#ffebee',100: '#ffcdd2',200: '#ef9a9a',300: '#e57373',400: '#ef5350',
          500: '#f44336',600: '#e53935',700: '#d32f2f',800: '#c62828',900: '#b71c1c',
          DEFAULT: '#d32f2f',light: '#ef5350',dark: '#c62828',
        },
        warning: {
          50: '#fff8e1',100: '#ffecb3',200: '#ffe082',300: '#ffd54f',400: '#ffca28',
          500: '#ffc107',600: '#ffb300',700: '#ffa000',800: '#ff8f00',900: '#ff6f00',
          DEFAULT: '#ffa000',light: '#ffb74d',dark: '#f57c00',
        },
        info: {
          50: '#e3f2fd',100: '#bbdefb',200: '#90caf9',300: '#64b5f6',400: '#42a5f5',
          500: '#2196f3',600: '#1e88e5',700: '#1976d2',800: '#1565c0',900: '#0d47a1',
          DEFAULT: '#2196f3',
        },
        amber: {
          50: '#fff8e1',100: '#ffecb3',200: '#ffe082',300: '#ffd54f',400: '#ffca28',
          500: '#ffc107',600: '#ffb300',700: '#ffa000',800: '#ff8f00',900: '#ff6f00',
        },
        orange: {
          50: '#fff3e0',100: '#ffe0b2',200: '#ffcc80',300: '#ffb74d',400: '#ffa726',
          500: '#ff9800',600: '#fb8c00',700: '#f57c00',800: '#ef6c00',900: '#e65100',
        },
        purple: {
          50: '#f3e5f5',100: '#e1bee7',200: '#ce93d8',300: '#ba68c8',400: '#ab47bc',
          500: '#9c27b0',600: '#8e24aa',700: '#7b1fa2',800: '#6a1b9a',900: '#4a148c',
        },
        pink: {
          50: '#fce4ec',100: '#f8bbd9',200: '#f48fb1',300: '#f06292',400: '#ec407a',
          500: '#e91e63',600: '#d81b60',700: '#c2185b',800: '#ad1457',900: '#880e4f',
        },
        indigo: {
          50: '#e8eaf6',100: '#c5cae9',200: '#9fa8da',300: '#7986cb',400: '#5c6bc0',
          500: '#3f51b5',600: '#3949ab',700: '#303f9f',800: '#283593',900: '#1a237e',
        },
        cyan: {
          50: '#e0f2f1',100: '#b2dfdb',200: '#80cbc4',300: '#4db6ac',400: '#26a69a',
          500: '#009688',600: '#00897b',700: '#00796b',800: '#00695c',900: '#004d40',
        },
        emerald: {
          50: '#ecfdf5',100: '#d1fae5',200: '#a7f3d0',300: '#6ee7b7',400: '#34d399',
          500: '#10b981',600: '#059669',700: '#047857',800: '#065f46',900: '#064e3b',
        },
        gray: {
          50: '#f9fafb',100: '#f3f4f6',200: '#e5e7eb',300: '#d1d5db',
          400: '#9ca3af',500: '#6b7280',600: '#4b5563',700: '#374151',
          800: '#1f2937',900: '#111827',
        },
      },
    },
  },
  plugins: [],
};
