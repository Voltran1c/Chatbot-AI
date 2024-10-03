/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        borderAnimation: {
          "0%": { borderColor: "#fca5a5" },
          "25%": { borderColor: "#fbbf24" },
          "50%": { borderColor: "#34d399" },
          "75%": { borderColor: "#60a5fa" },
          "100%": { borderColor: "#fca5a5" },
        },
      },
      animation: {
        "border-animate": "borderAnimation 5s linear infinite",
      },
    },
  },
  plugins: [],
};
