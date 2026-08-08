export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rtRed: '#ff4b2b',
        rtRedHover: '#e63e20',
        tomato: {
          100: '#ffdbd2',
          500: '#ff4b2b',
          600: '#e63e20',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        /* Soft 3D / Claymorphism shadows */
        'clay-input': 'inset 4px 4px 8px rgba(166, 171, 189, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.9)',
        'clay-input-dark': 'inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -4px -4px 8px rgba(255, 255, 255, 0.05)',
        'clay-btn': '4px 4px 10px rgba(255, 75, 43, 0.3), -4px -4px 10px rgba(255, 255, 255, 0.5), inset 2px 2px 6px rgba(255, 255, 255, 0.3)',
        'clay-btn-active': 'inset 4px 4px 8px rgba(200, 40, 8, 0.4), inset -4px -4px 8px rgba(255, 255, 255, 0.2)',
        'clay-btn-dark': '4px 4px 10px rgba(0, 0, 0, 0.4), -4px -4px 10px rgba(255, 255, 255, 0.05), inset 2px 2px 6px rgba(255, 255, 255, 0.1)',
        /* Pristine Glassmorphism */
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'blob': 'blob 10s infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      }
    },
  },
  plugins: [],
}
