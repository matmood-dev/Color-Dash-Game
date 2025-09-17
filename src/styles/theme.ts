import type { DefaultTheme } from "styled-components";

export const theme: DefaultTheme = {
  colors: {
    bg: "#0d0d0d",
    bgGradient:
      "radial-gradient(1200px circle at 50% -20%, #0b1220 0%, #0b0f1a 35%, #07090f 100%)",
    text: "#ffffff",
    subtext: "#94a3b8",
    hudBg: "rgba(15,23,42,0.60)",      
    hudBorder: "rgba(148,163,184,0.18)",
    player: ["#e63946", "#09ff00ff", "#00ccffff", "#f4a261"],
    obstacle: ["#e63946", "#09ff00ff", "#00ccffff", "#f4a261"],
  },
  radii: { lg: "16px", pill: "999px" },
  shadows: {
    xl: "0 30px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
  },
  font:
    'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji"',
};
