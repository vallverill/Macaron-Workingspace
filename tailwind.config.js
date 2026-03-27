/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        macaron: {
          navy:       '#1B3566',
          'navy-dark':'#0D1F3C',
          'navy-mid': '#162A52',
          'navy-hover':'#243D72',
          gold:       '#C9A227',
          'gold-light':'#E0B93B',
          'gold-dark': '#A8851F',
          sidebar:    '#1A1F36',
          'sidebar-hover': '#252B47',
          'sidebar-active': '#2E3657',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
