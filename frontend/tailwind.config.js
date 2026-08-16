/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        latte: {
          bg: '#F4ECD8',          // warm parchment base
          surface: '#EEE2C8',     // card surface, slightly deeper
          muted: '#CDB99A',       // subtle borders, dividers
          text: '#1A0F07',        // near-black espresso — primary text
          subtext: '#5C3D1E',     // medium warm brown — secondary text
          accent: '#7A4E2D',      // CTA buttons, active states
          accentHover: '#5A3320', // button hover
          border: '#1A0F07',      // box borders — same near-black as text, crisp
          ink: '#1A0F07',         // for headings, logo
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Instrument Sans', 'Inter', 'sans-serif'],
      },
      keyframes: {
        laserScan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(400%)' },
        },
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeSlideUp: 'fadeSlideUp 0.4s ease-out both',
        fadeIn: 'fadeIn 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
