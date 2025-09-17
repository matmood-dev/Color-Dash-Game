import styled from "styled-components";

const Wrapper = styled.div`
  min-height: 100vh;
  display:grid; place-items:center;
  padding: 24px;
`;

const Card = styled.div`
  width:min(720px, 92vw);
  background:${({theme})=>theme.colors.hudBg};
  border:1px solid ${({theme})=>theme.colors.hudBorder};
  border-radius:${({theme})=>theme.radii.lg};
  box-shadow:${({theme})=>theme.shadows.xl};
  backdrop-filter: blur(10px);
  padding: clamp(24px, 4vw, 40px);
  text-align:center;
`;

const Score = styled.div`
  margin-top: 6px;
  font-size: clamp(22px, 4vw, 28px);
  opacity:.9;
`;

const Button = styled.button`
  margin-top: 24px; padding: 12px 20px;
  border: 1px solid ${({theme})=>theme.colors.hudBorder};
  border-radius: ${({theme})=>theme.radii.pill};
  background: linear-gradient(180deg, #334155 0%, #111827 100%);
  color: white; font-size: 18px; cursor: pointer;
  transition: transform .08s ease;
  &:hover{ transform: translateY(-1px); }
  &:active{ transform: translateY(0); }
`;

type Props = { score: number; onRestart: () => void };

export default function GameOver({ score, onRestart }: Props) {
  return (
    <Wrapper>
      <Card>
        <h2 style={{margin:0}}>Game Over</h2>
        <Score>Score: {score}</Score>
        <Button onClick={onRestart}>Retry</Button>
      </Card>
    </Wrapper>
  );
}
