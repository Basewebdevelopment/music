/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c0f',
        surface: '#111418',
        surface2: '#181c22',
        border: '#252b38',
        accent: '#e8a23c',
        accent2: '#4fc3f7',
        accent3: '#81c784',
        danger: '#ef5350',
        text: '#e8eaf0',
        text2: '#8892a4',
      },
      fontFamily: {
        sans: ['Syne', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
