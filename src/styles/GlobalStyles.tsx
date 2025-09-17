import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box}
  html,body,#root{height:100%}
  body{
    margin:0;
    font-family:${({theme})=>theme.font};
    color:${({theme})=>theme.colors.text};
    background:${({theme})=>theme.colors.bg};
    background-image:${({theme})=>theme.colors.bgGradient};
    background-attachment: fixed;
  }
`;
