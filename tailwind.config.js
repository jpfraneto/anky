/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        standalone: { raw: "(display-mode:standalone)" },
      },
      keyframes: {
        animateSpin: {
          "0%": { transform: "rotate(0)" },
          "100%": { transform: "rotate(360)" },
        },
        growHeight: {
          "0%": { maxHeight: "0px" },
          "100%": { maxHeight: "400px" }, // Adjust this value as needed
        },
        shrink: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0)" },
        },
        grow: {
          "0%": { transform: "scale(0)" },
          "100%": { transform: "scale(1)" },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        wave: {
          "0%": { transform: "rotate(0.0deg)" },
          "15%": { transform: "rotate(14.0deg)" },
          "30%": { transform: "rotate(-8.0deg)" },
          "40%": { transform: "rotate(14.0deg)" },
          "50%": { transform: "rotate(-4.0deg)" },
          "60%": { transform: "rotate(10.0deg)" },
          "70%": { transform: "rotate(0.0deg)" },
          "100%": { transform: "rotate(0.0deg)" },
        },
      },
      animation: {
        shrink: "shrink 0.1s forwards",
        grow: "grow 0.1s forwards",
        fadeOut: "fadeOut 0.1s forwards",
        wave: "wave 1.5s infinite",
        growHeight: "growHeight 2s ease-in-out forwards", // 2s duration, ease-in-out timing function
      },
    },
  },
};
