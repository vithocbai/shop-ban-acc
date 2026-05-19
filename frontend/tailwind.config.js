/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#008BFF',
          hover: '#0076D9',
        },
        'bg-main': '#FFFFFF',
        'bg-secondary': '#FFFFFF',
        'border-color': '#E5E7E9',
        'text-main': '#1E293B',
        'text-secondary': '#647488',
        success: '#10B981',
        error: '#EF4444',
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      borderRadius: {
        'md': '8px',
      }
    },
  },
  plugins: [],
}
