import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./types/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        mochiy: ["var(--font-mochiy)"]
      },
      colors: {
        sunny: {
          DEFAULT: "#FFD966"
        },
        sky: {
          DEFAULT: "#A8D8FF"
        },
        cream: {
          DEFAULT: "#FFF8EE"
        },
        background: {
          DEFAULT: "#FFFDF8"
        },
        outline: {
          DEFAULT: "#222222"
        },
        border: {
          DEFAULT: "#E7DFC8"
        },
        text: {
          primary: "#222222",
          secondary: "#6B7280"
        },
        success: {
          DEFAULT: "#86D89A"
        },
        danger: {
          DEFAULT: "#F87171"
        },
        like: {
          DEFAULT: "#FF8DA1"
        }
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.06)"
      },
      borderRadius: {
        card: "1.25rem",
        button: "1rem",
        input: "1rem"
      }
    }
  },
  plugins: []
};

export default config;
