export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rtRed: '#fa320a',
        rtRedHover: '#d62706',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'clay': '8px 8px 16px #c5cbd5, -8px -8px 16px #ffffff',
        'clay-dark': '8px 8px 16px #0b1120, -8px -8px 16px #131d34',
        'clay-inner': 'inset 4px 4px 8px #c5cbd5, inset -4px -4px 8px #ffffff',
        'clay-inner-dark': 'inset 4px 4px 8px #0b1120, inset -4px -4px 8px #131d34',
        'clay-btn': '4px 4px 8px #c82808, -4px -4px 8px #ff3c0c',
        'clay-btn-active': 'inset 4px 4px 8px #c82808, inset -4px -4px 8px #ff3c0c',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        'glass-dark': '0 8px 32px 0 rgba(255, 255, 255, 0.05)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      },
      animation: {
        gradient: 'gradient 10s ease infinite',
      }
    },
  },
  plugins: [],
}
