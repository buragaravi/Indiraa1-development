/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: (() => {
    // All hex colors found in codebase
    const hexColors = ['2ecc71', '27ae60', 'f8faf8'];

    // All named colors found in codebase - EXPANDED for Safari compatibility
    const namedColors = [
      'primary','secondary','brand','success','error','warning','info',
      'amber','orange','purple','pink','indigo','cyan','emerald','gray',
      'green','red','blue','yellow','teal','white','black','slate',
      'zinc','neutral','stone','rose','fuchsia','violet','sky','lime'
    ];

    // All color shades including new ones found
    const colorShades = ['25','50','100','200','300','400','500','600','700','800','900','950'];

    // All prefixes found in codebase - EXPANDED for Safari compatibility
    const prefixes = [
      'bg','text','border','hover:bg','hover:text','hover:border',
      'focus:ring','focus:border','shadow','hover:shadow','from','to',
      'ring','divide','decoration','accent','caret','fill','stroke'
    ];

    // All opacity variants found - EXPANDED for Safari compatibility
    const opacities = ['','/5','/10','/20','/25','/30','/40','/50','/60','/70','/80','/90','/95'];

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

    // Add gradients and utility classes + Safari compatibility patterns + ALL FOUND PATTERNS
    list.push(
      // Basic gradients
      'bg-gradient-to-r','bg-gradient-to-l','bg-gradient-to-b','bg-gradient-to-t',
      'bg-gradient-to-br','bg-gradient-to-bl','bg-gradient-to-tr','bg-gradient-to-tl',
      
      // Hover gradients
      'hover:from-2ecc71','hover:to-27ae60',
      'hover:from-emerald-600','hover:to-teal-700',
      'hover:from-amber-600','hover:to-orange-700',
      
      // Backdrop blur variants
      'backdrop-blur-sm','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl',
      '-webkit-backdrop-filter', // Safari vendor prefix
      
      // Background opacities
      'bg-white/60','bg-white/80','bg-white/90','bg-white/95','bg-black/20',
      
      // Shadows
      'shadow-lg','shadow-md','shadow-sm','shadow-xl','shadow-2xl',
      'hover:shadow-lg','hover:shadow-xl','hover:shadow-2xl',
      'shadow-soft-lg', // Custom shadow
      
      // Transitions and animations
      'transition-all','transition-colors','transition-transform',
      'duration-200','duration-300','duration-500','animate-spin',
      
      // Safari-specific gradients
      '-webkit-linear-gradient', '-moz-linear-gradient',
      
      // Safari box shadows
      '-webkit-box-shadow',
      
      // Status badge patterns found in codebase
      'bg-green-100','text-green-800','border-green-200','bg-green-50','hover:bg-green-200',
      'bg-red-100','text-red-800','border-red-200','bg-red-50','hover:bg-red-200',
      'bg-blue-100','text-blue-800','border-blue-200','bg-blue-50','hover:bg-blue-200',
      'bg-yellow-100','text-yellow-800','border-yellow-200','bg-yellow-50','hover:bg-yellow-200',
      'bg-orange-100','text-orange-800','border-orange-200','bg-orange-50','hover:bg-orange-200',
      
      // Admin page gradients found
      'from-gray-50','to-gray-100','from-blue-50','to-blue-50',
      'from-green-50','to-emerald-100','from-emerald-100','to-emerald-50',
      'from-blue-600','to-indigo-600','from-green-500','to-emerald-600',
      'from-blue-500','to-cyan-600','from-emerald-500','to-teal-600',
      'from-green-600','to-emerald-600','from-yellow-400','to-yellow-500',
      
      // Focus ring patterns found
      'focus:ring-2','focus:ring-green-500/50','focus:ring-brand-300',
      'focus:ring-red-300','focus:ring-blue-500','focus:outline-none',
      'focus:border-green-500','focus:border-brand-500','focus:border-red-500',
      
      // Text gradient patterns
      'bg-clip-text','text-transparent',
      
      // Border patterns found
      'border-red-400/40','border-green-400/30','border-white/20',
      'border-white/30','border-white/40','border-red-100/50',
      
      // Shadow patterns with colors found
      'shadow-red-500/25','shadow-green-500/25','shadow-amber-500/25',
      'hover:shadow-red-500/10','hover:shadow-green-500/10',
      
      // Form checkbox patterns
      'form-checkbox','text-green-600','rounded-full',
      
      // Glass morphism patterns
      'backdrop-blur-sm','backdrop-blur-md',
      
      // Additional utility patterns found
      'disabled:opacity-50','group','last:border-b-0'
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
          25: '#f0fdf4',
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
