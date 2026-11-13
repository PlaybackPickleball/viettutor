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
        ink: "#0f2a24",
        jade: "#1f6b55",
        mist: "#d7ebe3",
        paper: "#f3f7f4",
        amber: "#c9842a",
        leaf: "#2f8f72",
        soft: "#e8f2ed",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        hand: ["var(--font-hand)", "cursive"],
      },
      boxShadow: {
        soft: "0 18px 40px -24px rgba(15, 42, 36, 0.45)",
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
