const { colors } = require('./src');

module.exports = {
  theme: {
    extend: {
      colors: colors,
      height: {
        fuller: '140%',
      },
      backgroundImage: {
        'gradient-login': 'linear-gradient(135deg, #54668E 0%, #22263D 100%)',
        'vera-pattern': 'url(/img/background.png)',
      },
      fontFamily: {
        fustat: ['Fustat', 'sans-serif'],
        lastik: ["Lastik", "sans-serif"],
      },
      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        notification: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-1rem) scale(0.95)',
          },
          '50%': {
            transform: 'translateY(0.25rem) scale(1.02)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        notificationIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        notificationOut: {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        toastIn: {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        toastOut: {
          '0%': {
            transform: 'translateX(0)',
            opacity: '1'
          },
          '100%': {
            transform: 'translateX(100%)',
            opacity: '0'
          }
        },
        skeleton: {
          '0%': {
            backgroundPosition: '200% 0'
          },
          '100%': {
            backgroundPosition: '-200% 0'
          }
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in forwards',
        notification: 'notification 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'notification-in': 'notificationIn 0.3s ease-out forwards',
        'notification-out': 'notificationOut 0.3s ease-in forwards',
        'fade-out': 'fadeOut 0.3s ease-out forwards',
        'toast-in': 'toastIn 0.3s ease-out forwards',
        'toast-out': 'toastOut 0.3s ease-in forwards',
        'skeleton': 'skeleton 1.5s infinite',
      },
    },
  },
  plugins: [],
};

