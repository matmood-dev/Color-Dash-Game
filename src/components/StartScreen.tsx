import styled from "styled-components";

const Wrapper = styled.div`
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100vh; background: ${({theme})=>theme.colors.bg};
  color: ${({theme})=>theme.colors.text};
  font-family: ${({theme})=>theme.font};
`;

const Button = styled.button`
  margin-top: 20px; padding: 12px 20px;
  border: none; border-radius: 8px;
  background: #2a9d8f; color: white;
  font-size: 18px; cursor: pointer;
  transition: 0.2s;
  &:hover { background: #21867a; }
`;

type Props = { onStart: () => void };

export default function StartScreen({ onStart }: Props) {
  return (
    <Wrapper>
      <h1>🎨 Color Dash</h1>
      <p>Tap or Press Space to switch colors & match obstacles</p>
      <Button onClick={onStart}>Play</Button>
    </Wrapper>
  );
}
