import styled from "styled-components";

const Wrapper = styled.div`
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100vh; background: ${({theme})=>theme.colors.bg};
  color: ${({theme})=>theme.colors.text};
`;

const Button = styled.button`
  margin-top: 20px; padding: 12px 20px;
  border: none; border-radius: 8px;
  background: #e63946; color: white;
  font-size: 18px; cursor: pointer;
`;

type Props = { score: number; onRestart: () => void };

export default function GameOver({ score, onRestart }: Props) {
  return (
    <Wrapper>
      <h2>Game Over!</h2>
      <p>Your Score: {score}</p>
      <Button onClick={onRestart}>Retry</Button>
    </Wrapper>
  );
}
