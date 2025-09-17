import { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { theme } from "../styles/theme";
import type { Difficulty } from "../types/game";

const Wrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 820px;
  margin: 24px auto;
  padding: 12px clamp(8px, 3vw, 16px);
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  backdrop-filter: blur(8px);
  /* safe areas */
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
`;

const Canvas = styled.canvas.attrs({ tabIndex: 0 })`
  display: block;
  width: 100%;
  height: auto; /* keep aspect based on width/height attrs */
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  touch-action: manipulation;
`;

const HUD = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: clamp(8px, 3vw, 14px);
  font-variant-numeric: tabular-nums;

  @media (max-width: 520px) {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
`;

const Pill = styled.div`
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 8px 12px;
  backdrop-filter: blur(8px);
  @media (max-width: 520px) {
    align-self: flex-start;
  }
`;

const Palette = styled.div`
  pointer-events: none;
  display: flex;
  gap: 8px;
  align-items: center;
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 6px 8px;
  backdrop-filter: blur(8px);
  @media (max-width: 520px) {
    align-self: flex-start;
  }
`;

const Swatch = styled.span<{ active: boolean; color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid
    ${({ active }) => (active ? "#fff" : "rgba(255,255,255,.35)")};
  background: ${({ color }) => color};
  box-shadow: ${({ active, color }) =>
    active ? `0 0 18px ${color}99` : "none"};

  @media (min-width: 520px) {
    width: 28px;
    height: 28px;
  }
`;

type Ob = { x: number; color: number; w: number; h: number; hit: boolean };

const SPEED_BASE = 4;
const STEP_NORMAL = 0.6;
const STEP_HARD = 0.35;

function baseSpeedFor(score: number, difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return SPEED_BASE;
    case "normal":
      return SPEED_BASE + Math.floor(score / 5) * STEP_NORMAL;
    case "hard":
      return SPEED_BASE + score * STEP_HARD;
  }
}

export default function GameCanvas({
  onGameOver,
  difficulty,
}: {
  onGameOver: (score: number) => void;
  difficulty: Difficulty;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const colorIndexRef = useRef(0);
  const obstacles = useRef<Ob[]>([]);
  const raf = useRef<number>(0);
  const running = useRef(true);
  const scoreRef = useRef(0);

  const dimRef = useRef({ w: 720, h: 420, dpr: 1 });
  const AR = 420 / 720;

  const setActiveColor = useCallback((i: number) => {
    colorIndexRef.current = i;
    setColorIndex(i);
  }, []);

  const setup = useCallback(() => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const cssW = Math.max(280, Math.round(rect.width));
    const cssH = Math.round(cssW * AR);
    const dpr = Math.min(
      2,
      Math.max(1, Math.floor(window.devicePixelRatio || 1))
    );

    dimRef.current = { w: cssW, h: cssH, dpr };

    c.width = cssW * dpr;
    c.height = cssH * dpr;

    c.style.width = cssW + "px";
    c.style.height = cssH + "px";

    const ctx = c.getContext("2d")!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }, []);

  const makeStars = useCallback(() => {
    const { w, h } = dimRef.current;
    const count = Math.max(30, Math.round((w * h) / 14000));
    return Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.4,
      v: Math.random() * 0.4 + 0.2,
    }));
  }, []);

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r = 10
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  useEffect(() => {
    const canvas = canvasRef.current!;
    setup();
    const ctx = canvas.getContext("2d")!;
    let frame = 0;

    let stars = makeStars();

    const loop = () => {
      if (!running.current) return;
      frame++;

      const { w: W, h: H } = dimRef.current;

      ctx.clearRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(
        W * 0.5,
        H * 0.14,
        30,
        W * 0.5,
        H * 0.5,
        Math.max(W, H)
      );
      grd.addColorStop(0, "rgba(255,255,255,0.06)");
      grd.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = 0.6;
      stars.forEach((s) => {
        s.x -= s.v;
        if (s.x < -2) {
          s.x = W + 2;
          s.y = Math.random() * H;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
      });
      ctx.restore();

      const playerX = W * 0.17;
      const playerY = H * 0.76;
      const playerR = Math.max(16, H * 0.081);

      const pColor = theme.colors.player[colorIndexRef.current];
      ctx.save();
      ctx.shadowColor = pColor + "99";
      ctx.shadowBlur = 18;
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = Math.max(3, playerR * 0.18);
      ctx.strokeStyle = "#ffffffaa";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(
        playerX,
        playerY,
        playerR + Math.max(3, playerR * 0.18),
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();

      const spawnEvery = 90;
      if (frame % spawnEvery === 0) {
        obstacles.current.push({
          x: W + 24,
          color: Math.floor(Math.random() * theme.colors.obstacle.length),
          w: Math.max(28, W * 0.064),
          h: Math.max(60, H * 0.205),
          hit: false,
        });
      }

      const speedScale = Math.max(1, W / 720); 
      const speed = baseSpeedFor(scoreRef.current, difficulty) * speedScale;

      for (let i = obstacles.current.length - 1; i >= 0; i--) {
        const obs = obstacles.current[i];
        obs.x -= speed;

        ctx.save();
        const c = theme.colors.obstacle[obs.color];
        ctx.shadowColor = c + "66";
        ctx.shadowBlur = 14;
        drawRoundedRect(
          ctx,
          obs.x,
          playerY - obs.h / 2,
          obs.w,
          obs.h,
          Math.max(8, W * 0.012)
        );
        ctx.fillStyle = c;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff55";
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();

        const rectL = obs.x;
        const rectR = obs.x + obs.w;
        const rectT = playerY - obs.h / 2;
        const rectB = playerY + obs.h / 2;
        const closestX = Math.max(rectL, Math.min(playerX, rectR));
        const closestY = Math.max(rectT, Math.min(playerY, rectB));
        const dx = playerX - closestX;
        const dy = playerY - closestY;
        const collides = dx * dx + dy * dy <= playerR * playerR;

        if (collides) {
          if (obs.color !== colorIndexRef.current) {
            running.current = false;
            cancelAnimationFrame(raf.current);
            onGameOver(scoreRef.current);
            return;
          }
          if (!obs.hit) {
            obs.hit = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        }

        if (rectR < -60) obstacles.current.splice(i, 1);
      }

      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, playerY + playerR + H * 0.03, W, 2);
      ctx.globalAlpha = 1;

      raf.current = requestAnimationFrame(loop);
    };

    running.current = true;
    raf.current = requestAnimationFrame(loop);

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setActiveColor(
          (colorIndexRef.current + 1) % theme.colors.player.length
        );
      }
    };
    const handleClick = () => {
      setActiveColor((colorIndexRef.current + 1) % theme.colors.player.length);
      canvas.focus();
    };

    const handleResize = () => {
      setup();
      stars = makeStars();
      const { w: W } = dimRef.current;
      obstacles.current.forEach((o) => {
        if (o.x > W + 40) o.x = W + 40;
      });
    };

    canvas.addEventListener("keydown", handleKey);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    canvas.focus();

    return () => {
      running.current = false;
      cancelAnimationFrame(raf.current);
      canvas.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [onGameOver, setup, makeStars, setActiveColor, difficulty]);

  return (
    <Wrap>
      <Canvas ref={canvasRef} />
      <HUD>
        <Pill>
          Score: <strong style={{ marginLeft: 6 }}>{score}</strong>
          <span
            style={{
              marginLeft: 10,
              opacity: 0.75,
              fontSize: 12,
              textTransform: "capitalize",
            }}
          >
            {difficulty}
          </span>
        </Pill>
        <Palette aria-hidden="true">
          {theme.colors.player.map((c, i) => (
            <Swatch key={c} color={c} active={i === colorIndex} />
          ))}
          <span
            style={{ color: theme.colors.subtext, marginLeft: 8, fontSize: 12 }}
          >
            Space / Tap canvas
          </span>
        </Palette>
      </HUD>
    </Wrap>
  );
}
