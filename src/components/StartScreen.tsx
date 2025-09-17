import styled from "styled-components";
import { useState } from "react";
import type { Difficulty } from "../types/game";

const Wrapper = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const Card = styled.div`
  width: min(720px, 92vw);
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  backdrop-filter: blur(10px);
  padding: clamp(24px, 4vw, 40px);
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: clamp(28px, 5vw, 40px);
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Segments = styled.div`
  display: inline-flex;
  margin-top: 16px;
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.hudBg};
`;

const SegBtn = styled.button<{ active: boolean }>`
  appearance: none;
  border: 0;
  padding: 8px 14px;
  cursor: pointer;
  color: ${({ active }) => (active ? "#fff" : "rgba(255,255,255,.8)")};
  background: ${({ active }) => (active ? "rgba(255,255,255,.08)" : "transparent")};
  font-weight: 600;
  &:not(:last-child){ border-right:1px solid rgba(255,255,255,.12); }
`;

const Button = styled.button`
  margin-top: 20px;
  padding: 12px 20px;
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: linear-gradient(180deg, #1f2937 0%, #0f172a 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.08s ease;
  &:hover { transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

const Credit = styled.a`
  display: inline-block;
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.subtext};
  text-decoration: none;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.subtext};
  &:hover { color:#fff; border-bottom-color:#fff; }
`;

type Props = { onStart: (difficulty: Difficulty) => void };

export default function StartScreen({ onStart }: Props) {
  const [diff, setDiff] = useState<Difficulty>("normal");

  return (
    <Wrapper>
      <Card>
        <Title>🎨 Color Dash</Title>
        <Sub>Match your color to pass. Space or click canvas to switch.</Sub>

        <Segments role="tablist" aria-label="Select difficulty">
          {(["easy","normal","hard"] as Difficulty[]).map(d => (
            <SegBtn
              key={d}
              active={diff === d}
              onClick={() => setDiff(d)}
              role="tab"
              aria-selected={diff === d}
            >
              {d}
            </SegBtn>
          ))}
        </Segments>

        <Button onClick={() => onStart(diff)}>Play</Button>

        <div style={{ marginTop: 8 }}>
          <Credit
            href="https://matmood.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Mahmood portfolio"
          >
            Created by Mahmood
          </Credit>
        </div>
      </Card>
    </Wrapper>
  );
}
