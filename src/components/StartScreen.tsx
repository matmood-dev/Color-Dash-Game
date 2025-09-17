import styled from "styled-components";
import {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import type { ComponentType } from "react";
import type { Difficulty } from "../types/game";
import { Leaf, Gauge, Fire, Palette } from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import type {} from "react";

const STORAGE_KEY = "color-dash:difficulty";
const DIFFS: Difficulty[] = ["easy", "normal", "hard"];

function readSaved(): Difficulty | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY) as Difficulty | null;
    return v && (DIFFS as string[]).includes(v) ? v : null;
  } catch {
    return null;
  }
}

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
  text-transform: uppercase;

  display: inline-flex;
  align-items: center;
  gap: 10px;

  background: linear-gradient(90deg, #fff, #cbd5e1 55%, #9ca3af);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  svg {
    color: #fff;
    filter: drop-shadow(0 2px 10px rgba(255, 255, 255, 0.08));
  }
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
  letter-spacing: 0.2px;
  text-transform: capitalize;
  color: ${({ active }) => (active ? "#fff" : "rgba(255,255,255,.82)")};
  background: ${({ active }) =>
    active ? "rgba(255,255,255,.10)" : "transparent"};
  &:not(:last-child) {
    border-right: 1px solid rgba(255, 255, 255, 0.12);
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
  transition: transform 0.08s ease, box-shadow 0.15s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  }
  &:active {
    transform: translateY(0);
  }
`;

const Credit = styled.a`
  display: inline-block;
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.subtext};
  text-decoration: none;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.subtext};
  &:hover {
    color: #fff;
    border-bottom-color: #fff;
  }
`;

type Props = { onStart: (difficulty: Difficulty) => void };

type IconComp = ComponentType<IconProps>;

const icons: Record<Difficulty, IconComp> = {
  easy: Leaf,
  normal: Gauge,
  hard: Fire,
};

export default function StartScreen({ onStart }: Props) {
  const [diff, setDiff] = useState<Difficulty>(() => readSaved() ?? "normal");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, diff);
    } catch {
      //
    }
  }, [diff]);

  const labels = useMemo(
    () => ({
      easy: { tip: "steady speed" },
      normal: { tip: "+speed each 5 points" },
      hard: { tip: "+speed every point" },
    }),
    []
  );

  const cycle = useCallback(
    (dir: 1 | -1) => {
      const idx = DIFFS.indexOf(diff);
      setDiff(DIFFS[(idx + dir + DIFFS.length) % DIFFS.length]);
    },
    [diff]
  );

  const handleStart = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, diff);
    } catch {
      //
    }
    onStart(diff);
  }, [diff, onStart]);

  return (
    <Wrapper>
      <Card>
        <Title>
          <Palette size="1.15em" weight="fill" aria-hidden="true" />
          COLOR DASH
        </Title>
        <Sub>Match your color to pass. Space or click canvas to switch.</Sub>

        <Segments
          role="tablist"
          aria-label="Select difficulty"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              e.preventDefault();
              cycle(1);
            }
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              cycle(-1);
            }
            if (e.key === "Enter") {
              e.preventDefault();
              handleStart();
            }
          }}
        >
          {DIFFS.map((d) => {
            const Icon = icons[d];
            return (
              <SegBtn
                key={d}
                active={diff === d}
                onClick={() => setDiff(d)}
                role="tab"
                aria-selected={diff === d}
                aria-label={`${d} difficulty`}
                title={`${d} — ${labels[d].tip}`}
              >
                <Icon
                  size={18}
                  weight="bold"
                  style={{ opacity: 0.95, marginRight: 8 }}
                />
                {d}
              </SegBtn>
            );
          })}
        </Segments>

        <SegHint>{labels[diff].tip}</SegHint>

        <Button onClick={handleStart}>Play</Button>

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
