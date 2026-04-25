/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema futurista: Negro y Verde fosforescente
        neon: {
          50: '#e0ff51',
          100: '#d1ff40',
          200: '#c0ff2f',
          300: '#a8ff00',
          400: '#8cff1f',
          500: '#00ff41',  // Verde neon principal
          600: '#00dd00',  // Verde más oscuro
          700: '#00bb00',
          800: '#009900',
          900: '#006600',
        },
        dark: {
          50: '#f0f0f0',
          100: '#e0e0e0',
          200: '#d0d0d0',
          300: '#c0c0c0',
          400: '#a0a0a0',
          500: '#808080',
          600: '#606060',
          700: '#404040',
          800: '#1a1a1a',  // Negro profundo
          900: '#0a0a0a',  // Negro absoluto
        },
        primary: {
          50: '#e0ff51',
          500: '#00ff41',
          600: '#00dd00',
          700: '#00bb00',
          900: '#006600'
        },
        secondary: {
          50: '#1a1a1a',
          500: '#0f0f0f',
          700: '#0a0a0a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 255, 65, 0.5)',
        'neon-lg': '0 0 20px rgba(0, 255, 65, 0.6)',
        'neon-xl': '0 0 30px rgba(0, 255, 65, 0.7)',
      },
      borderColor: {
        'neon': '#00ff41',
        'neon-dark': '#00dd00',
      }
    },
  },
  plugins: [],
}
