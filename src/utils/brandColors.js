// Brand color utilities for consistent vibrant colors across the app
// Use these instead of direct hex values for better production builds

export const brandColors = {
  // Main brand colors
  primary: '#2ecc71',        // bg-brand-500 or bg-brand-green-main
  primaryHover: '#27ae60',   // bg-brand-600 or bg-brand-green-hover
  primarySoft: '#f8faf8',    // bg-brand-green-soft
  
  // Tailwind class mappings for better performance
  classes: {
    // Backgrounds
    bgPrimary: 'bg-brand-500',
    bgPrimaryHover: 'bg-brand-600', 
    bgPrimarySoft: 'bg-brand-green-soft',
    bgPrimaryLight: 'bg-brand-100',
    bgPrimaryDark: 'bg-brand-800',
    
    // Text
    textPrimary: 'text-brand-500',
    textPrimaryHover: 'text-brand-600',
    textPrimaryLight: 'text-brand-300',
    textPrimaryDark: 'text-brand-800',
    
    // Borders
    borderPrimary: 'border-brand-500',
    borderPrimaryLight: 'border-brand-200',
    
    // Hover states
    hoverBgPrimary: 'hover:bg-brand-500',
    hoverBgPrimaryDark: 'hover:bg-brand-600',
    hoverTextPrimary: 'hover:text-brand-500',
    
    // Focus states
    focusRingPrimary: 'focus:ring-brand-500',
    focusRingPrimaryLight: 'focus:ring-brand-300',
  }
};

// Component-specific color combinations
export const componentColors = {
  button: {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-300',
    secondary: 'bg-brand-100 text-brand-800 hover:bg-brand-200 focus:ring-brand-300',
    outline: 'border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-300',
  },
  
  card: {
    primary: 'bg-white border-brand-100 shadow-lg',
    highlighted: 'bg-brand-50 border-brand-200 shadow-lg',
  },
  
  status: {
    success: 'bg-brand-100 text-brand-800 border-brand-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
  },
  
  form: {
    input: 'border-brand-200 focus:border-brand-500 focus:ring-brand-300',
    inputError: 'border-red-300 focus:border-red-500 focus:ring-red-300',
    label: 'text-brand-700 font-medium',
  }
};

// Color replacement map for migration from hex to Tailwind classes
export const colorReplacements = {
  // Direct hex to Tailwind class mapping
  'bg-[#2ecc71]': 'bg-brand-500',
  'bg-[#27ae60]': 'bg-brand-600', 
  'bg-[#f8faf8]': 'bg-brand-green-soft',
  'text-[#2ecc71]': 'text-brand-500',
  'text-[#27ae60]': 'text-brand-600',
  'border-[#2ecc71]': 'border-brand-500',
  'hover:bg-[#2ecc71]': 'hover:bg-brand-500',
  'hover:bg-[#27ae60]': 'hover:bg-brand-600',
  'hover:text-[#2ecc71]': 'hover:text-brand-500',
  'focus:ring-[#2ecc71]': 'focus:ring-brand-500',
  
  // Opacity variations
  'bg-[#2ecc71]/10': 'bg-brand-500/10',
  'bg-[#2ecc71]/20': 'bg-brand-500/20',
  'bg-[#2ecc71]/50': 'bg-brand-500/50',
  'bg-[#2ecc71]/70': 'bg-brand-500/70',
  'bg-[#2ecc71]/80': 'bg-brand-500/80',
  'text-[#2ecc71]/60': 'text-brand-500/60',
  'text-[#2ecc71]/70': 'text-brand-500/70',
};

export default brandColors;
