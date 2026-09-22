import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F1E3D",
        "navy-light": "#33456B",
        red: "#C8102E",
        "red-dark": "#A50D24",
        ink: "#14171F",
        muted: "#5B6472",
        line: "#E2E5EA",
        surface: "#F4F5F7",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
