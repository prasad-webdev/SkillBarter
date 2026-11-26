/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#1a237e', dark: '#0d1757', light: '#e8eaf6' },
        orange: { DEFAULT: '#FF6F00', light: '#fff3e0' },
      }
    }
  },
  plugins: []
}
