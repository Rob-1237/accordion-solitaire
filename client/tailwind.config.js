/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',    // Small mobile landscape
      'sm': '640px',    // Mobile landscape
      'md': '768px',    // Tablet
      'lg': '1024px',   // Desktop
      'xl': '1280px',   // Large desktop
      '2xl': '1536px',  // Extra large desktop
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      // Typography scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        // Responsive typography
        'responsive-sm': ['clamp(0.875rem, 2vw, 1rem)', { lineHeight: '1.5' }],
        'responsive-base': ['clamp(1rem, 2.5vw, 1.25rem)', { lineHeight: '1.5' }],
        'responsive-lg': ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '1.5' }],
        'responsive-xl': ['clamp(1.5rem, 4vw, 2rem)', { lineHeight: '1.5' }],
      },
      // Spacing scale
      spacing: {
        '4xs': '0.125rem',  // 2px
        '3xs': '0.25rem',   // 4px
        '2xs': '0.375rem',  // 6px
        'xs': '0.5rem',     // 8px
        'sm': '0.75rem',    // 12px
        'md': '1rem',       // 16px
        'lg': '1.25rem',    // 20px
        'xl': '1.5rem',     // 24px
        '2xl': '2rem',      // 32px
        '3xl': '2.5rem',    // 40px
        '4xl': '3rem',      // 48px
        '5xl': '4rem',      // 64px
        '6xl': '5rem',      // 80px
        '7xl': '6rem',      // 96px
        '8xl': '8rem',      // 128px
      },
      // Card-specific spacing
      card: {
        'spacing-sm': '0.5rem',
        'spacing-md': '0.75rem',
        'spacing-lg': '1rem',
      },
      // Animation keyframes
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        }
      },
      // Animation classes
      animation: {
        'shake': 'shake 0.5s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        // Responsive animations
        'responsive-fade': 'fade-in 0.3s ease-out var(--animation-delay, 0s)',
        'responsive-scale': 'scale-in 0.2s ease-out var(--animation-delay, 0s)',
      },
      // Touch-friendly sizes
      touch: {
        'min': '44px',  // Minimum touch target size
        'md': '48px',   // Medium touch target
        'lg': '56px',   // Large touch target
      },
      // Z-index scale
      zIndex: {
        'toast': '1000',
        'modal': '1100',
        'overlay': '1200',
        'tooltip': '1300',
      },
    },
  },
  plugins: [
    // Add container queries plugin if needed
    // require('@tailwindcss/container-queries'),
  ],
};
