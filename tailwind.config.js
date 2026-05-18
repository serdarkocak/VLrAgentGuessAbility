/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        valorant: {
          dark: '#0F1923',
          red: '#FF4655',
          gray: '#1C2B3A',
          light: '#ECE8E1',
        },
      },
      fontFamily: {
        valorant: ['"Tungsten"', 'Impact', 'sans-serif'],
        body: ['"DIN Next"', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(255, 70, 85, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
      },
      animation: {
        waveform: 'waveform 1s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        'flash-green': 'flashGreen 0.5s ease-out',
        'flash-red': 'flashRed 0.5s ease-out',
      },
      keyframes: {
        waveform: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-6px)' },
          '75%': { transform: 'translateX(6px)' },
        },
        flashGreen: {
          '0%': { backgroundColor: 'rgba(34, 197, 94, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(255, 70, 85, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
    },
  },
  plugins: [],
};
