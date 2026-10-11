/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'system-ui', 'sans-serif'],
        display: ['Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#7892b8',
          500: '#5e7a9e',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929',
        },
        gold: {
          50: '#fdfaf2',
          100: '#faf0d8',
          200: '#f5e0b0',
          300: '#edc97a',
          400: '#e0b04d',
          500: '#c5a55a',
          600: '#a8884a',
          700: '#8a6e3a',
          800: '#6e5630',
          900: '#5a4628',
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        slideIn: 'slideIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};
