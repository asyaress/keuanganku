import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#f7fbfb',
          card: '#ffffff',
          line: '#dceceb',
          text: '#0f1720',
          muted: '#5f6f72',
          accent: '#20c8c7',
          accentDark: '#119ea2',
          accentSoft: '#e8fbfb',
          expense: '#ff8e7d',
          income: '#2cb38a',
          gold: '#f1b84b'
        }
      },
      boxShadow: {
        soft: '0 14px 40px rgba(12, 31, 44, 0.08)',
        card: '0 10px 30px rgba(32, 200, 199, 0.10)'
      },
      backgroundImage: {
        'app-gradient': 'linear-gradient(180deg, #62dbde 0%, #2ec7ca 65%, #19b0b5 100%)',
        'app-soft': 'linear-gradient(180deg, rgba(98,219,222,0.18) 0%, rgba(98,219,222,0.02) 100%)'
      }
    },
  },
  plugins: [],
} satisfies Config;
