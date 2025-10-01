/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#f59e0b",
          600: "#d97706",
        }
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.04)"
      },
      borderRadius: {
        "2xl": "1rem"
      }
    },
  },
  plugins: [],
}
