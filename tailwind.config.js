/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mango: {
          light: '#ffd953',
          mid: '#ffb347',
          dark: '#ff8c42',
        }
      }
    },
  },
  plugins: [],
};