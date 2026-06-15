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
          50: '#E6F2FF',
          100: '#B3D9FF',
          200: '#80C0FF',
          300: '#4DA7FF',
          400: '#1A8EFF',
          500: '#1E90FF',
          600: '#0072E5',
          700: '#0057B3',
          800: '#003D80',
          900: '#00224D',
        },
        secondary: {
          50: '#FFF7E6',
          100: '#FFE6B3',
          200: '#FFD680',
          300: '#FFC54D',
          400: '#FFB41A',
          500: '#FFA500',
          600: '#E69500',
          700: '#B37300',
          800: '#805200',
          900: '#4D3100',
        },
      },
      fontFamily: {
        sans: ['Microsoft YaHei', 'SimHei', 'sans-serif'],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
