import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        elevated: "var(--color-elevated)",
        "accent-green": "var(--color-accent-green)",
        "accent-blue": "var(--color-accent-blue)",
        "accent-amber": "var(--color-accent-amber)",
        primary: "#c1c7ce",
        secondary: "#939eb4",
        tertiary: "#e4ebff",
        muted: "var(--color-text-muted)",
        background: "#0d0e0f",
        "on-background": "#e3e5e9",
        "on-primary": "#3b4147",
        "on-surface": "#e3e5e9",
        "surface-dim": "#0d0e0f",
        "surface-container-low": "#121415",
        "surface-container-lowest": "#000000",
        "secondary-container": "#313c4e",
        "outline-variant": "#45484b",
        error: "#ee7d77"
      },
      borderRadius: {
        standard: "var(--radius-standard)",
        small: "var(--radius-small)"
      },
      fontFamily: {
        headline: ["Inter"],
        body: ["Inter"],
        label: ["Space Grotesk"],
        mono: "var(--font-mono)",
        sans: "var(--font-sans)"
      }
    }
  },
  plugins: []
} satisfies Config;
