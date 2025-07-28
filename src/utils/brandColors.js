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
  
  // Gradient replacements
  'from-[#2ecc71]': 'from-brand-500',
  'to-[#27ae60]': 'to-brand-600',
  'from-[#27ae60]': 'from-brand-600',
  'to-[#2ecc71]': 'to-brand-500',
  'from-[#f8faf8]': 'from-brand-green-soft',
  'hover:from-[#27ae60]': 'hover:from-brand-600',
  'hover:to-[#2ecc71]': 'hover:to-brand-500',
  
  // Shadow replacements
  'shadow-[#2ecc71]/5': 'shadow-brand-500/5',
  'shadow-[#2ecc71]/10': 'shadow-brand-500/10',
  'shadow-[#2ecc71]/25': 'shadow-brand-500/25',
  'shadow-[#2ecc71]/40': 'shadow-brand-500/40',
  'hover:shadow-[#2ecc71]/10': 'hover:shadow-brand-500/10',
  'hover:shadow-[#2ecc71]/40': 'hover:shadow-brand-500/40',
  
  // Opacity variations
  'bg-[#2ecc71]/10': 'bg-brand-500/10',
  'bg-[#2ecc71]/20': 'bg-brand-500/20',
  'bg-[#2ecc71]/25': 'bg-brand-500/25',
  'bg-[#2ecc71]/40': 'bg-brand-500/40',
  'bg-[#2ecc71]/50': 'bg-brand-500/50',
  'bg-[#2ecc71]/70': 'bg-brand-500/70',
  'bg-[#2ecc71]/80': 'bg-brand-500/80',
  'text-[#2ecc71]/60': 'text-brand-500/60',
  'text-[#2ecc71]/70': 'text-brand-500/70',
  'border-[#2ecc71]/20': 'border-brand-500/20',
  'focus:ring-[#2ecc71]/50': 'focus:ring-brand-500/50',
};

// Status color systems
export const statusColors = {
  // Order statuses
  order: {
    pending: 'bg-orange-50 text-orange-600 border-orange-200',
    shipped: 'bg-purple-50 text-purple-600 border-purple-200',
    delivered: 'bg-green-50 text-green-600 border-green-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
  },
  
  // Return statuses  
  return: {
    requested: 'bg-amber-50 text-amber-700 border-amber-200',
    admin_review: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    warehouse_assigned: 'bg-purple-50 text-purple-700 border-purple-200',
    pickup_scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    picked_up: 'bg-orange-50 text-orange-700 border-orange-200',
    in_warehouse: 'bg-teal-50 text-teal-700 border-teal-200',
    quality_checked: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    refund_approved: 'bg-green-50 text-green-700 border-green-200',
    refund_processed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
  }
};

// Vibrant button configurations  
export const buttonStyles = {
  // Add to Cart button
  addToCart: {
    normal: 'bg-gradient-to-r from-[#2ecc71] to-[#27ae60] text-white hover:from-[#27ae60] hover:to-[#2ecc71] shadow-[#2ecc71]/25 hover:shadow-[#2ecc71]/40',
    inCart: 'bg-[#f8faf8] text-[#2ecc71] border-2 border-[#2ecc71]/20 shadow-[#2ecc71]/10',
    disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
  },
  
  // Buy Now button
  buyNow: {
    normal: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-amber-500/25 hover:shadow-amber-500/40',
    disabled: 'bg-gray-100 text-gray-400 cursor-not-allowed'
  },
  
  // Primary action button
  primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-300',
  
  // Secondary action button  
  secondary: 'bg-brand-100 text-brand-800 hover:bg-brand-200 focus:ring-brand-300',
  
  // Outline button
  outline: 'border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-300',
};

// Glass morphism effects
export const glassEffects = {
  light: 'bg-white/80 backdrop-blur-sm border-white/30',
  medium: 'bg-white/90 backdrop-blur-md border-white/40', 
  strong: 'bg-white/95 backdrop-blur-lg border-white/50',
  dark: 'bg-black/20 backdrop-blur-sm border-white/10'
};

export default brandColors;
