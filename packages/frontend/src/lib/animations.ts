/**
 * CSS Animation Utilities
 * Pure CSS animations without external dependencies
 */

export const fadeIn = {
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },
  animation: 'fadeIn 0.3s ease-in-out'
}

export const slideUp = {
  '@keyframes slideUp': {
    from: { 
      opacity: 0,
      transform: 'translateY(20px)' 
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0)' 
    }
  },
  animation: 'slideUp 0.4s ease-out'
}

export const slideDown = {
  '@keyframes slideDown': {
    from: { 
      opacity: 0,
      transform: 'translateY(-20px)' 
    },
    to: { 
      opacity: 1,
      transform: 'translateY(0)' 
    }
  },
  animation: 'slideDown 0.4s ease-out'
}

export const scaleIn = {
  '@keyframes scaleIn': {
    from: { 
      opacity: 0,
      transform: 'scale(0.95)' 
    },
    to: { 
      opacity: 1,
      transform: 'scale(1)' 
    }
  },
  animation: 'scaleIn 0.3s ease-out'
}

export const shimmer = {
  '@keyframes shimmer': {
    '0%': { backgroundPosition: '-1000px 0' },
    '100%': { backgroundPosition: '1000px 0' }
  },
  animation: 'shimmer 2s infinite linear',
  background: 'linear-gradient(to right, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
  backgroundSize: '1000px 100%'
}

export const pulse = {
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.7 }
  },
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
}

export const bounce = {
  '@keyframes bounce': {
    '0%, 100%': { 
      transform: 'translateY(0)',
      animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
    },
    '50%': { 
      transform: 'translateY(-25%)',
      animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
    }
  },
  animation: 'bounce 1s infinite'
}

export const spin = {
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' }
  },
  animation: 'spin 1s linear infinite'
}

// Tailwind animation classes
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-400',
  slideDown: 'animate-in slide-in-from-top-4 duration-400',
  slideLeft: 'animate-in slide-in-from-right-4 duration-400',
  slideRight: 'animate-in slide-in-from-left-4 duration-400',
  scaleIn: 'animate-in zoom-in-95 duration-300',
  scaleOut: 'animate-out zoom-out-95 duration-300',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce'
}

// Staggered animations for lists
export const getStaggerDelay = (index: number, baseDelay: number = 50): string => {
  return `${index * baseDelay}ms`
}

// Transition utilities
export const transitions = {
  default: 'transition-all duration-300 ease-in-out',
  fast: 'transition-all duration-150 ease-in-out',
  slow: 'transition-all duration-500 ease-in-out',
  colors: 'transition-colors duration-300 ease-in-out',
  transform: 'transition-transform duration-300 ease-in-out',
  opacity: 'transition-opacity duration-300 ease-in-out'
}

// Hover effects
export const hoverEffects = {
  lift: 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300',
  glow: 'hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300',
  scale: 'hover:scale-105 transition-transform duration-300',
  brightness: 'hover:brightness-110 transition-all duration-300'
}
