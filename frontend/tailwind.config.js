/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmic: {
          darkest: '#02040a',
          bg: '#040711',
          surface: '#0a1124',
          card: '#0c1328',
          cardHover: '#131e3d',
          elevated: '#101b35',
          border: 'rgba(56, 189, 248, 0.12)',
          borderHover: 'rgba(56, 189, 248, 0.35)',
        },
        cyan: {
          glow: '#38bdf8',
          plasma: '#00f0ff',
          dim: 'rgba(56, 189, 248, 0.15)',
        },
        amber: {
          combustion: '#f59e0b',
          flame: '#ff6b35',
          dim: 'rgba(245, 158, 11, 0.15)',
        },
        space: {
          green: '#10b981',
          danger: '#ef4444',
          textMuted: '#94a3b8',
          textMain: '#f1f5f9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(56, 189, 248, 0.25)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0a1124 0%, #040711 100%)',
        'glass-card': 'linear-gradient(135deg, rgba(16, 27, 53, 0.7) 0%, rgba(8, 13, 26, 0.85) 100%)',
        'cyan-gradient': 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
        'flame-gradient': 'linear-gradient(90deg, #f59e0b 0%, #ff6b35 100%)',
      }
    },
  },
  plugins: [],
}
