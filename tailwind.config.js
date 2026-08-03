/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk Variable"', '"Space Grotesk"', 'Inter', 'sans-serif'], // charakterní nadpisy
      },
      colors: {
        // Akcentní "sportovní" neonová zelená
        accent: { DEFAULT: '#39FF14', dim: '#2bd40e', soft: 'rgba(57,255,20,0.12)' },
        // Tmavá paleta — dominantní šedá/černá
        ink: { 950: '#08080a', 900: '#0d0d10', 850: '#141418', 800: '#1b1b21', 700: '#26262e', 600: '#3a3a45' },
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(57,255,20,0.45), 0 22px 70px -22px rgba(57,255,20,0.4)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
        glow: {
          '0%,100%': { boxShadow: '0 0 0 1px rgba(57,255,20,.5), 0 0 22px -6px rgba(57,255,20,.55)' },
          '50%': { boxShadow: '0 0 0 1px rgba(57,255,20,.8), 0 0 46px -2px rgba(57,255,20,.9)' },
        },
        'gradient-shift': {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.16,1,.3,1) both',
        marquee: 'marquee 28s linear infinite',
        'spin-slow': 'spin-slow 6s linear infinite',
        glow: 'glow 2.6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
      },
    },
  },
  plugins: [],
};
