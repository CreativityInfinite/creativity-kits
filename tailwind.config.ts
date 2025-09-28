import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: ['./app.vue', './pages/**/*.{vue,js,ts}', './components/**/*.{vue,js,ts}', './layouts/**/*.{vue,js,ts}', './tools/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a0a',
          card: '#101012',
          soft: '#141417'
        },
        primary: {
          DEFAULT: '#7c3aed',
          500: '#7c3aed',
          600: '#6d28d9'
        },
        'theme-primary': 'rgb(var(--theme-primary) / <alpha-value>)',
        'theme-secondary': 'rgb(var(--theme-secondary) / <alpha-value>)',
        accent: {
          pink: '#ec4899',
          cyan: '#22d3ee',
          lime: '#84cc16',
          amber: '#f59e0b'
        }
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      },
      boxShadow: {
        glow: '0 0 40px rgba(124, 58, 237, 0.25)'
      }
    }
  },
  plugins: [animate]
} satisfies Config;
