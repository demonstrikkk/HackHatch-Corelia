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
          light: '#14B8A6',  // Teal
          dark: '#0D9488',   // Darker Teal
        },
        secondary: {
          light: '#EC4899',  // Magenta
          dark: '#DB2777',   // Darker Magenta
        },
        accent: {
          light: '#F59E0B',  // Gold
          dark: '#D97706',   // Darker Gold
        },
        background: {
          light: '#FAFAFA',  // Soft white
          dark: '#0F172A',   // Slate dark
        },
        surface: {
          light: '#FFFFFF',  // Pure white
          dark: '#1E293B',   // Lighter slate
        },
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
