/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        oryx: {
          blue: '#1a3a8f',
          'blue-dark': '#0d2666',
          'blue-light': '#2a4fa8',
          'blue-header': '#1e3f9e',
          'blue-border': '#3a5fc0',
          'text-blue': '#1a3a8f',
        },
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

