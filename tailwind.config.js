const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fifa: {
          navy:   '#020F2A',
          dark:   '#0A1929',
          blue:   '#0D2C54',
          accent: '#D4AF37',
          gold:   '#D4AF37',
          silver: '#9CA3AF',
          red:    '#E02424',
          green:  '#00C853',
          white:  '#FFFFFF',
          orange: '#FF6D00',
          teal:   '#00BFA5',
          cream:  '#FFF8E1',
          gray:   '#6B7280',
        },
        glass: {
          bg:     'rgba(2, 15, 42, 0.88)',
          border: 'rgba(255, 255, 255, 0.08)',
          hover:  'rgba(212, 175, 55, 0.08)',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        display: ['var(--font-display)', ...fontFamily.sans],
      },
      backgroundImage: {
        'stadium-gradient': 'linear-gradient(180deg, #020F2A 0%, #0A0A1A 100%)',
        'gold-gradient':    'linear-gradient(135deg, #D4AF37, #F5D87A, #D4AF37)',
        'fifa-gradient':    'linear-gradient(135deg, #020F2A 0%, #0D2C54 50%, #020F2A 100%)',
        'hero-gradient':    'linear-gradient(135deg, #020F2A 0%, #1A1A2E 40%, #16213E 70%, #0F3460 100%)',
        'card-gradient':    'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'live-gradient':    'linear-gradient(135deg, #E02424 0%, #FF6D00 100%)',
        'accent-gradient':  'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(212, 175, 55, 0.15)',
        'blue-glow': '0 0 40px rgba(13, 44, 84, 0.4)',
        'glass':     '0 8px 32px rgba(0, 0, 0, 0.4)',
        'card':      '0 4px 24px rgba(0, 0, 0, 0.2)',
        'live':      '0 0 20px rgba(224, 36, 36, 0.2)',
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease',
        'slide-up':  'slideUp 0.5s ease',
        'slide-down': 'slideDown 0.3s ease',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float':     'float 3s ease-in-out infinite',
        'ticker':    'ticker 30s linear infinite',
        'score-pulse': 'scorePulse 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGold: { '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.15)' }, '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.3)' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        ticker:    { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        scorePulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
      },
    },
  },
  plugins: [],
};
