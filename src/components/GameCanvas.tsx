import { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import { theme } from "../styles/theme";
import type { Difficulty } from "../types/game";

const Wrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 820px;
  margin: 48px auto;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  backdrop-filter: blur(8px);
`;

const Canvas = styled.canvas.attrs({ tabIndex: 0 })`
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
`;

const HUD = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px;
  font-variant-numeric: tabular-nums;
`;

const Pill = styled.div`
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 8px 12px;
  backdrop-filter: blur(8px);
`;

const Palette = styled.div`
  pointer-events: none;
  display: flex; gap: 8px; align-items: center;
  background: ${({ theme }) => theme.colors.hudBg};
  border: 1px solid ${({ theme }) => theme.colors.hudBorder};
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 6px 8px;
  backdrop-filter: blur(8px);
`;

const Swatch = styled.span<{ active: boolean; color: string }>`
  width: 28px; height: 28px; border-radius: 50%;
  display: inline-block;
  border: 2px solid ${({ active }) => (active ? "#fff" : "rgba(255,255,255,.35)")};
  background: ${({ color }) => color};
  box-shadow: ${({ active, color }) => (active ? `0 0 24px ${color}99` : "none")};
`;

type Ob = { x: number; color: number; w: number; h: number; hit: boolean };

const SPEED_BASE = 4;
const STEP_NORMAL = 0.6; // per 5 points
const STEP_HARD = 0.35;  // per 1 point

function speedFor(score: number, difficulty: Difficulty): number {
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

  const setActiveColor = useCallback((i: number) => {
    colorIndexRef.current = i;
    setColorIndex(i);
  }, []);

  const setup = useCallback(() => {
    const c = canvasRef.current!;
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const cssW = 720;
    const cssH = 420;
    c.width = cssW * dpr;
    c.height = cssH * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
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

    // Scene
    const playerX = 120;
    const playerY = 320;
    const playerR = 34;

    // Parallax particles
    const stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * 720,
      y: Math.random() * 420,
      r: Math.random() * 1.2 + 0.4,
      v: Math.random() * 0.4 + 0.2,
    }));

    const loop = () => {
      if (!running.current) return;
      frame++;

      ctx.clearRect(0, 0, 720, 420);

      // Vignette
      const grd = ctx.createRadialGradient(360, 60, 30, 360, 210, 520);
      grd.addColorStop(0, "rgba(255,255,255,0.06)");
      grd.addColorStop(1, "rgba(0,0,0,0.9)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 720, 420);

      // Stars
      ctx.save();
      ctx.globalAlpha = 0.6;
      stars.forEach((s) => {
        s.x -= s.v;
        if (s.x < -2) {
          s.x = 722;
          s.y = Math.random() * 420;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
      });
      ctx.restore();

      // Player
      const pColor = theme.colors.player[colorIndexRef.current];
      ctx.save();
      ctx.shadowColor = pColor + "99";
      ctx.shadowBlur = 24;
      ctx.fillStyle = pColor;
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerR, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#ffffffaa";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerR + 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Spawn
      const spawnEvery = 90; // constant spawn cadence
      if (frame % spawnEvery === 0) {
        obstacles.current.push({
          x: 720 + 24,
          color: Math.floor(Math.random() * theme.colors.obstacle.length),
          w: 46,
          h: 86,
          hit: false,
        });
      }

      // Speed from difficulty
      const speed = speedFor(scoreRef.current, difficulty);

      // Obstacles
      for (let i = obstacles.current.length - 1; i >= 0; i--) {
        const obs = obstacles.current[i];
        obs.x -= speed;

        ctx.save();
        const c = theme.colors.obstacle[obs.color];
        ctx.shadowColor = c + "66";
        ctx.shadowBlur = 18;
        drawRoundedRect(ctx, obs.x, playerY - obs.h / 2, obs.w, obs.h, 10);
        ctx.fillStyle = c;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#ffffff55";
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();

        // Collision
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
            // obs.hit = true;
            // scoreRef.current += 1;
            // setScore(scoreRef.current);
          }
          if (!obs.hit) {
            obs.hit = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }
        }

        if (rectR < -60) obstacles.current.splice(i, 1);
      }

      // Ground line
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, playerY + playerR + 18, 720, 2);
      ctx.globalAlpha = 1;

      raf.current = requestAnimationFrame(loop);
    };

    running.current = true;
    raf.current = requestAnimationFrame(loop);

    // Controls: only canvas click and Space
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setActiveColor((colorIndexRef.current + 1) % theme.colors.player.length);
      }
    };
    const handleClick = () => {
      setActiveColor((colorIndexRef.current + 1) % theme.colors.player.length);
      canvas.focus();
    };

    canvas.addEventListener("keydown", handleKey);
    canvas.addEventListener("click", handleClick);
    canvas.focus();

    return () => {
      running.current = false;
      cancelAnimationFrame(raf.current);
      canvas.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("click", handleClick);
    };
  }, [onGameOver, setup, setActiveColor, difficulty]);

  return (
    <Wrap>
      <Canvas ref={canvasRef} width={720} height={420} />
      <HUD>
        <Pill>
          Score: <strong style={{ marginLeft: 6 }}>{score}</strong>
          <span style={{ marginLeft: 10, opacity: 0.75, fontSize: 12, textTransform: "capitalize" }}>
            {difficulty}
          </span>
        </Pill>
        <Palette aria-hidden="true">
          {theme.colors.player.map((c, i) => (
            <Swatch key={c} color={c} active={i === colorIndex} />
          ))}
          <span style={{ color: theme.colors.subtext, marginLeft: 8, fontSize: 12 }}>
            Space / Click canvas
          </span>
        </Palette>
      </HUD>
    </Wrap>
  );
}
