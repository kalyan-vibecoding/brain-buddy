import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete, useShuffledQueue, MAX_ROUNDS } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";

const SHAPES = [
  { id: "circle",    render: () => <div className="w-20 h-20 bg-primary rounded-full" /> },
  { id: "square",    render: () => <div className="w-20 h-20 bg-secondary rounded-2xl" /> },
  { id: "triangle",  render: () => <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[69px] border-l-transparent border-r-transparent border-b-accent" /> },
  { id: "star",      render: () => (
    <svg viewBox="0 0 24 24" className="w-20 h-20 text-destructive fill-current">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  )},
  { id: "diamond",   render: () => <div className="w-14 h-14 bg-purple-500 rotate-45 rounded-sm" /> },
  { id: "rectangle", render: () => <div className="w-24 h-12 bg-teal-500 rounded-xl" /> },
  { id: "heart",     render: () => (
    <svg viewBox="0 0 24 24" className="w-20 h-20 text-pink-500 fill-current">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )},
  { id: "hexagon",   render: () => (
    <svg viewBox="0 0 100 100" className="w-20 h-20 fill-orange-400">
      <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" />
    </svg>
  )},
];

export default function MatchShape() {
  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(CreateCompletionBodyActivityType.match_shape);

  const queue = useShuffledQueue(SHAPES.slice(0, MAX_ROUNDS));
  const targetShape = queue[Math.min(roundCount, queue.length - 1)];

  const options = useMemo(() => {
    const numOptions = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
    const others = SHAPES.filter(s => s.id !== targetShape.id).sort(() => Math.random() - 0.5).slice(0, numOptions - 1);
    return [...others, targetShape].sort(() => Math.random() - 0.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCount, difficulty]);

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Match Shape" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12 gap-12">
        <div className="w-48 h-48 bg-card rounded-[3rem] shadow-xl border-4 border-card-border flex items-center justify-center">
          <motion.div
            key={targetShape.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            {targetShape.render()}
          </motion.div>
        </div>

        <div className="w-full bg-card rounded-[3rem] p-8 shadow-md border-2 border-card-border">
          <p className="text-center text-xl font-bold text-muted-foreground mb-6">Find the match!</p>
          <div className="flex flex-wrap justify-center gap-6">
            {options.map((shape) => (
              <motion.button
                key={shape.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAnswer(shape.id === targetShape.id)}
                disabled={!!feedback}
                className="w-32 h-32 bg-muted rounded-3xl flex items-center justify-center hover:bg-muted-foreground/10 transition-colors border-4 border-transparent focus:border-primary focus:outline-none"
              >
                {shape.render()}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <FeedbackOverlay feedback={feedback} />
    </div>
  );
}
