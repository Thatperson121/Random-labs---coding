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
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          '50': 'rgb(var(--primary-rgb) / 0.05)',
          '100': 'rgb(var(--primary-rgb) / 0.1)',
          '200': 'rgb(var(--primary-rgb) / 0.2)',
          '300': 'rgb(var(--primary-rgb) / 0.3)',
          '400': 'rgb(var(--primary-rgb) / 0.4)',
          '500': 'rgb(var(--primary-rgb) / 0.5)',
          '600': 'rgb(var(--primary-rgb) / 0.6)',
          '700': 'rgb(var(--primary-rgb) / 0.7)',
          '800': 'rgb(var(--primary-rgb) / 0.8)',
          '900': 'rgb(var(--primary-rgb) / 0.9)',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
