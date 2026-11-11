/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', '"Iowan Old Style"', '"Palatino Linotype"', 'Georgia', 'serif'],
        sans: ['"Instrument Serif"', '"Iowan Old Style"', '"Palatino Linotype"', 'Georgia', 'serif'],
        serif: ['"Instrument Serif"', '"Iowan Old Style"', '"Palatino Linotype"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.8rem', { lineHeight: '1.3' }],       // ~13.5px
        'xs': ['0.925rem', { lineHeight: '1.35' }],      // ~15.5px (was 12px)
        'sm': ['1.05rem', { lineHeight: '1.45' }],       // ~17.5px (was 14px)
        'base': ['1.175rem', { lineHeight: '1.5' }],     // ~19.5px (was 16px)
        'lg': ['1.3rem', { lineHeight: '1.45' }],        // ~21.5px (was 18px)
        'xl': ['1.45rem', { lineHeight: '1.4' }],        // ~24px (was 20px)
        '2xl': ['1.75rem', { lineHeight: '1.3' }],       // ~29px (was 24px)
        '3xl': ['2.25rem', { lineHeight: '1.25' }],      // ~37px (was 30px)
        '4xl': ['2.85rem', { lineHeight: '1.2' }],       // ~47px (was 36px)
        '5xl': ['3.6rem', { lineHeight: '1.15' }],       // ~60px (was 48px)
      },
      colors: {
        obsidian: {
          DEFAULT: '#080A0C',
          subtle: '#0D1014',
          card: '#101419',
          elevated: '#171C22',
          border: '#252B32',
        },
        forge: {
          bg: '#080A0C',
          surface: '#0D1014',
          card: '#101419',
          hover: '#171C22',
          border: '#252B32',
          'border-light': '#363D47',
          text: '#F5F3EA',
          secondary: '#969DA6',
          muted: '#686F78',
          lime: '#C8FF3D',
          'lime-dark': '#8EB82A',
          'lime-glow': 'rgba(200, 255, 61, 0.12)',
          positive: '#78E08F',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 4s linear infinite',
        'scan': 'scan 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-up': 'slideInUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(-50%) scaleX(0.6)', opacity: '0.3' },
          '50%': { transform: 'translateY(50%) scaleX(1)', opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
