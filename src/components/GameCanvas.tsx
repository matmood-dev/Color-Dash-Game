import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { theme } from "../styles/theme";

const Canvas = styled.canvas`
  display: block;
  margin: 0 auto;
  background: ${theme.colors.bg};
`;

type GameState = "running" | "over";

export default function GameCanvas({ onGameOver }: { onGameOver: (score:number)=>void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  // Obstacle
  const obstacles = useRef<{x:number, color:number}[]>([]);
  const speed = 4;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let animation: number;
    let frame = 0;
    let playerY = canvas.height - 100;

    const playerX = 100;
    const playerSize = 40;

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Player
      ctx.fillStyle = theme.colors.player[colorIndex];
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerSize, 0, Math.PI * 2);
      ctx.fill();

      // Spawn obstacles
      if(frame % 100 === 0){
        obstacles.current.push({
          x: canvas.width,
          color: Math.floor(Math.random()*theme.colors.obstacle.length)
        });
      }

      // Move + draw obstacles
      obstacles.current.forEach((obs, i) => {
        ctx.fillStyle = theme.colors.obstacle[obs.color];
        ctx.fillRect(obs.x, playerY - playerSize, 40, 80);
        obs.x -= speed;

        // Collision
        if(obs.x < playerX + playerSize && obs.x+40 > playerX-playerSize){
          if(obs.color !== colorIndex){
            cancelAnimationFrame(animation);
            onGameOver(score);
          } else {
            setScore(prev => prev+1);
            obstacles.current.splice(i,1);
          }
        }
      });

      animation = requestAnimationFrame(loop);
    };

    animation = requestAnimationFrame(loop);

    const handleKey = (e:KeyboardEvent) => {
      if(e.code === "Space"){
        setColorIndex(c => (c+1)%theme.colors.player.length);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(animation);
      window.removeEventListener("keydown", handleKey);
    };
  }, [colorIndex, score, onGameOver]);

  return (
    <>
      <Canvas ref={canvasRef} width={600} height={400} />
      <p style={{color:"white", textAlign:"center"}}>Score: {score}</p>
    </>
  );
}
