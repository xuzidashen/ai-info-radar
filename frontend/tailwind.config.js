/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Aptos', 'Microsoft YaHei UI', 'Noto Sans CJK SC', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 60px rgba(27, 24, 20, 0.12)',
      },
    },
  },
  plugins: [],
};

