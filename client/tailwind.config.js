/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(14, 165, 233, 0.12), 0 4px 12px -4px rgba(15, 23, 42, 0.05)',
        'premium-hover': '0 20px 40px -15px rgba(14, 165, 233, 0.22), 0 8px 20px -6px rgba(15, 23, 42, 0.08)',
        'sky-glow': '0 0 25px -5px rgba(56, 189, 248, 0.35)'
      }
    },
  },
  plugins: [],
}
