const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fifa: {
          navy: '#0a1628',
          dark: '#0d1f3c',
          blue: '#1a3a6b',
          accent: '#c8a951',
          gold: '#d4a843',
          silver: '#b8bec4',
          red: '#e63946',
          green: '#2ec866',
          white: '#f0f2f5',
        },
        glass: {
          bg: 'rgba(15, 31, 60, 0.85)',
          border: 'rgba(200, 169, 81, 0.2)',
          hover: 'rgba(200, 169, 81, 0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        display: ['var(--font-display)', ...fontFamily.sans],
      },
      backgroundImage: {
        'stadium-gradient': 'linear-gradient(180deg, #0a1628 0%, #061220 100%)',
        'gold-gradient': 'linear-gradient(135deg, #d4a843, #f5e6a3, #d4a843)',
        'glass-gradient': 'linear-gradient(180deg, rgba(200,169,81,0.03) 0%, transparent 60%)',
      },
      boxShadow: {
        'gold-glow': '0 0 30px rgba(200, 169, 81, 0.15)',
        'blue-glow': '0 0 40px rgba(26, 58, 107, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease',
        'slide-up': 'slideUp 0.5s ease',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseGold: { '0%, 100%': { boxShadow: '0 0 20px rgba(200,169,81,0.15)' }, '50%': { boxShadow: '0 0 40px rgba(200,169,81,0.3)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};
