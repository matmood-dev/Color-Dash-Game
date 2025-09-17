import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      bg: string;
      bgGradient: string;
      text: string;
      subtext: string;
      hudBg: string;
      hudBorder: string;
      player: string[];
      obstacle: string[];
    };
    radii: { lg: string; pill: string };
    shadows: { xl: string };
    font: string;
  }
}
