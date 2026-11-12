/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        docmind: {
          bg: '#070b14',
          sidebar: '#060a12',
          surface: '#0d1424',
          surfaceHover: '#131e35',
          border: '#17223b',
          borderLight: '#1f2d4f',
          accent: '#2563eb',
          accentHover: '#1d4ed8',
          accentGlow: 'rgba(37, 99, 235, 0.15)',
          text: '#f1f5f9',
          muted: '#8b9bb4',
          subtle: '#4b556b',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Menlo',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
