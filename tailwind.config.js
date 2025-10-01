/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#16a34a", 600: "#15803d" }
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
};
export default config;
