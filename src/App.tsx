import { useState } from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";
import { GlobalStyles } from "./styles/GlobalStyles";
import StartScreen from "./components/StartScreen";
import GameCanvas from "./components/GameCanvas";
import GameOver from "./components/GameOver";

export default function App() {
  const [phase, setPhase] = useState<"start"|"play"|"over">("start");
  const [finalScore, setFinalScore] = useState(0);

  const handleGameOver = (score:number) => {
    setFinalScore(score);
    setPhase("over");
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {phase==="start" && <StartScreen onStart={()=>setPhase("play")} />}
      {phase==="play" && <GameCanvas onGameOver={handleGameOver} />}
      {phase==="over" && <GameOver score={finalScore} onRestart={()=>setPhase("start")} />}
    </ThemeProvider>
  );
}
