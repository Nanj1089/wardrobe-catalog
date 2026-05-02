import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F4EF",
        card: "#FFFFFF",
        primary: "#B8864B",
        ink: "#2F2A26",
        muted: "#8B8177",
        line: "#E9E2D8",
        tag: "#F2E8DA",
        success: "#7BAA7B",
        info: "#7E9FC8",
        warning: "#D89A4A"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(47, 42, 38, 0.05)"
      },
      borderRadius: {
        xl2: "18px"
      },
      fontFamily: {
        sans: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
        display: ["'Noto Serif SC'", "Songti SC", "STSong", "serif"]
      },
      width: {
        sidebar: "220px",
        rail: "320px"
      },
      spacing: {
        18: "4.5rem"
      }
    }
  },
  plugins: []
} satisfies Config;
