/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'brand-beige': '#F5F5DC',
        'brand-white': '#FFFFFF',
        'brand-gray': '#E0E0E0',
        'brand-blue': '#1E90FF',
        background: '#FFFFFF',
        foreground: '#111827',
        primary: '#1E90FF',
        secondary: '#F5F5DC',
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}