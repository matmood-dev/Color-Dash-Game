import { useState } from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import StartScreen from "./components/StartScreen";
import GameCanvas from "./components/GameCanvas";
import GameOver from "./components/GameOver";
import type { Difficulty } from "./types/game";

export default function App() {
  const [phase, setPhase] = useState<"start" | "play" | "over">("start");
  const [finalScore, setFinalScore] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  const handleStart = (d: Difficulty) => {
    setDifficulty(d);
    setPhase("play");
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setPhase("over");
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {phase === "start" && <StartScreen onStart={handleStart} />}
      {phase === "play" && (
        <GameCanvas difficulty={difficulty} onGameOver={handleGameOver} />
      )}
      {phase === "over" && (
        <GameOver score={finalScore} onRestart={() => setPhase("start")} />
      )}
    </ThemeProvider>
  );
}
