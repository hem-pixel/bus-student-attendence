/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',      // Blue
        secondary: '#10B981',    // Green
        danger: '#EF4444',       // Red
        warning: '#F59E0B',      // Amber
        dark: '#1F2937',         // Dark gray
        light: '#F3F4F6',        // Light gray
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
