/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./*.js"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#faf6f1', 100: '#f0e6d6', 200: '#e0ccab', 300: '#cdac79',
          400: '#bf9355', 500: '#b07d3e', 600: '#966434', 700: '#7a4e2d',
          800: '#654029', 900: '#553625', 950: '#2f1b12',
        },
        accent: {
          50: '#fefbec', 100: '#fcf4cb', 200: '#f9e793', 300: '#f5d555',
          400: '#f0c02d', 500: '#daa520', 600: '#b8801a', 700: '#935e18',
          800: '#7a4a1b', 900: '#673d1c', 950: '#3c1f0b',
        },
        dark: {
          50: '#f7f5f2', 100: '#ece7df', 200: '#d9cfbf', 300: '#c3b299',
          400: '#ab9272', 500: '#997e5e', 600: '#836a4f', 700: '#6b5442',
          800: '#594639', 900: '#312720', 950: '#1a1410',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      screens: {
        'xs': '475px',
        '3xl': '1920px'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      },
      zIndex: {
        '60': '60', '70': '70', '80': '80', '90': '90', '100': '100'
      },
    }
  },
  plugins: [],
}