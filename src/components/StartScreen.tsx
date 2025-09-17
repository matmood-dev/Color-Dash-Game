import styled from "styled-components";
import { useState, useMemo, useCallback } from "react";
import type { Difficulty } from "../types/game";

const Wrapper = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const Card = styled.div`
  position: relative;
  width: min(720px, 92vw);
  padding: clamp(24px, 4vw, 40px);
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  backdrop-filter: blur(10px);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: conic-gradient(
      from 120deg,
      #60a5fa33,
      #22d3ee33,
      #f59e0b33,
      #ef444433,
      #60a5fa33
    );
    filter: blur(18px);
    z-index: -1;
  }
`;

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: clamp(28px, 5vw, 44px);
  line-height: 1.1;
  background: linear-gradient(90deg, #fff, #cbd5e1 55%, #9ca3af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Segments = styled.div`
  display: inline-flex;
  margin-top: 18px;
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.hudBg};
  outline: none;
`;

const SegBtn = styled.button<{ active: boolean }>`
  appearance: none;
  border: 0;
  padding: 10px 16px;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: .2px;
  text-transform: capitalize;

  color: ${({ active }) => (active ? "#fff" : "rgba(255,255,255,.82)")};
  background: ${({ active }) => (active ? "rgba(255,255,255,.10)" : "transparent")};

  &:not(:last-child) {
    border-right: 1px solid rgba(255,255,255,.12);
  }

  &:focus-visible {
    outline: 2px solid #ffffffaa;
    outline-offset: -2px;
  }
`;

const SegHint = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Button = styled.button`
  margin-top: 22px;
  padding: 12px 22px;
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: linear-gradient(180deg, #1f2937 0%, #0f172a 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: transform .08s ease, box-shadow .15s ease;

  &:hover { transform: translateY(-1px); box-shadow: 0 12px 30px rgba(0,0,0,.35); }
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

const Chips = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 14px;
`;

const Chip = styled.span`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  color: ${({ theme }) => theme.colors.subtext};
`;

type Props = { onStart: (difficulty: Difficulty) => void };

export default function StartScreen({ onStart }: Props) {
  const [diff, setDiff] = useState<Difficulty>("normal");

  const labels = useMemo(
    () => ({
      easy: { emoji: "🐣", tip: "steady speed" },
      normal: { emoji: "⚖️", tip: "+speed each 5 points" },
      hard: { emoji: "🔥", tip: "+speed every point" },
    }),
    []
  );

  const cycle = useCallback((dir: 1 | -1) => {
    const order: Difficulty[] = ["easy", "normal", "hard"];
    const idx = order.indexOf(diff);
    setDiff(order[(idx + dir + order.length) % order.length]);
  }, [diff]);

  return (
    <Wrapper>
      <Card>
        <Title>🎨 Color Dash</Title>
        <Sub>Match your color to pass. Space or click canvas to switch.</Sub>

        <Segments
          role="tablist"
          aria-label="Select difficulty"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); cycle(1); }
            if (e.key === "ArrowLeft")  { e.preventDefault(); cycle(-1); }
            if (e.key === "Enter")      { e.preventDefault(); onStart(diff); }
          }}
        >
          {(["easy","normal","hard"] as Difficulty[]).map(d => (
            <SegBtn
              key={d}
              active={diff === d}
              onClick={() => setDiff(d)}
              role="tab"
              aria-selected={diff === d}
              aria-label={`${d} difficulty`}
              title={`${d} — ${labels[d].tip}`}
            >
              <span style={{opacity:.95, marginRight:8}}>{labels[d].emoji}</span>
              {d}
            </SegBtn>
          ))}
        </Segments>

        <SegHint>{labels[diff].tip}</SegHint>

        <Chips>
          <Chip>Space = switch</Chip>
          <Chip>Click canvas = switch</Chip>
          <Chip>←/→ to choose</Chip>
          <Chip>Enter to start</Chip>
        </Chips>

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
