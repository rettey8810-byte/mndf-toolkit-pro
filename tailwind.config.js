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
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        olive: {
          50: '#f4f5f0',
          100: '#e8ebe0',
          200: '#d4dac5',
          300: '#b8c2a0',
          400: '#98a678',
          500: '#7a8a56',
          600: '#5c6b3e',
          700: '#4a562f',
          800: '#3d4629',
          900: '#333c25',
          950: '#1a1f10',
        },
        sand: {
          50: '#f9f8f5',
          100: '#f0ede6',
          200: '#e2dbd0',
          300: '#cfc2b0',
          400: '#b8a68e',
          500: '#a38b6e',
          600: '#8b7359',
          700: '#705a49',
          800: '#5d4b3e',
          900: '#4d3e35',
        },
        military: {
          green: '#4B5320',
          dark: '#3D3D29',
          tan: '#C2B280',
          brown: '#8B4513',
          navy: '#1a2744',
        }
      }
    },
  },
  plugins: [],
}
