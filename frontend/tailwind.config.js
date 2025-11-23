/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#D2BD96',  // Beige
          dark: '#CE653B',   // Orange from gradient
        },
        secondary: {
          light: '#B8A67D',  // Darker beige
          dark: '#2B0948',   // Purple from gradient
        },
        accent: {
          light: '#E5D9C1',  // Light beige
          dark: '#8B4E8B',   // Mid purple-orange
        },
        background: {
          light: '#FAFDF3',  // Off-white
          dark: '#2B0948',   // Purple base
        },
        surface: {
          light: '#FAFDF3',  // Off-white
          dark: '#3D1556',   // Lighter purple
        },
        'purple-dark': '#2B0948',
        'orange-dark': '#CE653B',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
