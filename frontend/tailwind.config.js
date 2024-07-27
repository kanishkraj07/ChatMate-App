/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js'
  ],
  theme: {
    extend: {},
    colors: {
      'primary-bg': '#1F1D36',
      'primary-bg-30': '#13111E',
      'primary-bg-50': '#0B090E',
      'primary-tint-1': '#1b182b',
      'primary-blue': '#167bba',
      'secondary-blue': '#4c91ffd9',
      'primary-red': "#cb112d",
      'primary-slate': "#e5e7eb",
      'primary-gray': '#969faf',
      'primary-green': '#00c278',
      'light-bg-gray': 'rgb(106, 113, 117)',
      'light-slate': '#cbd5e1',
      'light-red': 'rgba(253, 75, 78)',
      'light-primary-30': 'rgba(19, 17, 30, 0.5)'
    },
    fontFamily: {
      sans: ['Inter Var']
    },
    backgroundImage: {
      'gradient-135': 'linear-gradient(135deg, #00c278 0%, #00c278 50%, transparent 50%)'
    }
  },
  plugins: [require('flowbite/plugin')],
}

