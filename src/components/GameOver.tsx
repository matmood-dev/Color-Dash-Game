import styled from "styled-components";
import { Skull, ArrowCounterClockwise } from "@phosphor-icons/react";

const Wrapper = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const Card = styled.div`
  position: relative;
  width: min(720px, 92vw);
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  backdrop-filter: blur(10px);
  padding: clamp(24px, 4vw, 40px);
  text-align: center;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: conic-gradient(
      from 120deg,
      #ef444433,
      #f59e0b33,
      #22d3ee33,
      #60a5fa33,
      #ef444433
    );
    filter: blur(18px);
    z-index: -1;
  }
`;

const Title = styled.h2`
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(26px, 5vw, 40px);
  line-height: 1.1;
  text-transform: uppercase;

  background: linear-gradient(90deg, #fff, #cbd5e1 55%, #9ca3af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  svg { color: #fff; filter: drop-shadow(0 2px 10px rgba(255,255,255,.08)); }
`;

const Score = styled.div`
  margin-top: 10px;
  font-size: clamp(24px, 5vw, 36px);
  font-variant-numeric: tabular-nums;
  opacity: .95;
`;

const Roast = styled.div`
  margin: 10px auto 0;
  width: fit-content;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px dashed #ef4444aa;
  color: #ffb4b4;
  letter-spacing: .5px;
  text-transform: uppercase;
  font-weight: 800;
  box-shadow: 0 0 24px #ef444426;
`;

const Button = styled.button`
  margin-top: 22px;
  padding: 12px 20px;
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: linear-gradient(180deg, #334155 0%, #111827 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform .08s ease, box-shadow .15s ease;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  &:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(0,0,0,.35); }
  &:active { transform: translateY(0); }
`;

type Props = { score: number; onRestart: () => void };

export default function GameOver({ score, onRestart }: Props) {
  return (
    <Wrapper>
      <Card>
        <Title>
          <Skull size="1.2em" weight="fill" aria-hidden="true" />
          Game Over
        </Title>

        <Score>Score: {score}</Score>

        <Roast>LMAO WHAT A NOOB</Roast>

        <Button onClick={onRestart}>
          <ArrowCounterClockwise size={20} weight="bold" />
          Retry
        </Button>
      </Card>
    </Wrapper>
  );
}
