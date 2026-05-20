/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        valorant: {
          dark: '#0F1923',
          red: '#FF4655',
          gray: '#1F2731',
          light: '#ECE8E1',
          navy: '#0a1420',
        },
        neon: {
          pink: '#ff3d8b',
          magenta: '#f72585',
          purple: '#a855f7',
          violet: '#7c3aed',
          blue: '#6da4ff',
          cyan: '#22d3ee',
        },
      },
      fontFamily: {
        valorant: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['Rajdhani', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(255, 70, 85, 0.5), 0 0 48px rgba(255, 70, 85, 0.18)',
        'glow-soft': '0 0 18px rgba(255, 70, 85, 0.4)',
        'glow-strong': '0 0 32px rgba(255, 70, 85, 0.7), 0 0 64px rgba(255, 70, 85, 0.3)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.2)',
        'glow-purple': '0 0 24px rgba(168, 85, 247, 0.45)',
        'glow-blue': '0 0 24px rgba(109, 164, 255, 0.45)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      backgroundImage: {
        'glass-sheen':
          'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 100%)',
        'red-gradient': 'linear-gradient(180deg, #ff4655 0%, #c92e3c 100%)',
        'v-gradient': 'linear-gradient(180deg, #6da4ff 0%, #a855f7 60%, #c45cff 100%)',
      },
      animation: {
        waveform: 'waveform 1s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        'flash-green': 'flashGreen 0.5s ease-out',
        'flash-red': 'flashRed 0.5s ease-out',
        'float-slow': 'float 18s ease-in-out infinite',
        'float-medium': 'float 12s ease-in-out infinite',
        'float-fast': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
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
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-30px) translateX(20px) rotate(8deg)' },
          '66%': { transform: 'translateY(20px) translateX(-15px) rotate(-6deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.08)' },
        },
      },
    },
  },
  plugins: [],
};
