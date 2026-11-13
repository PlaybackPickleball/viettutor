import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#3d2e24",
        jade: "#c45c38",
        mist: "#f3e6d8",
        paper: "#fffaf3",
        amber: "#e08a45",
        leaf: "#d9784f",
        soft: "#f7efe4",
        cream: "#f6efe6",
        coral: "#e07a4a",
        lotus: "#c45c38",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      boxShadow: {
        soft: "0 16px 36px -20px rgba(61, 46, 36, 0.35)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.55" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        strokeDraw: {
          "0%": { strokeDashoffset: "1" },
          "100%": { strokeDashoffset: "0" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.92)", opacity: "0.7" },
          "70%": { transform: "scale(1.15)", opacity: "0" },
          "100%": { transform: "scale(1.15)", opacity: "0" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.86) translateY(6px)" },
          "70%": { opacity: "1", transform: "scale(1.04) translateY(0)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.12)" },
        },
      },
      animation: {
        breathe: "breathe 5s ease-in-out infinite",
        riseIn: "riseIn 0.55s ease-out both",
        strokeDraw: "strokeDraw 1.6s ease-in-out forwards",
        pulseRing: "pulseRing 1.4s ease-out infinite",
        pop: "pop 0.45s ease-out both",
        sparkle: "sparkle 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
