import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete, MAX_ROUNDS } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";

const EMOJIS = ["🍎", "🚗", "🐶", "🎈", "⭐", "🦋", "🍪", "🧸", "🐸", "🌺"];

function generateRounds(total: number) {
  const usedEmojis = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, total);
  return usedEmojis.map((emoji, i) => {
    const count = (i % 9) + 1;
    // Pick 3 distractors from the full 1-10 pool (excluding correct count) — never hangs
    const pool = Array.from({ length: 10 }, (_, j) => j + 1).filter(n => n !== count);
    const distractors = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [count, ...distractors].sort(() => Math.random() - 0.5);
    return { emoji, count, options };
  });
}

export default function CountObjects() {
  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(CreateCompletionBodyActivityType.count_objects);

  const [rounds] = useState(() => generateRounds(MAX_ROUNDS));
  const round = rounds[Math.min(roundCount, rounds.length - 1)];

  const displayCount = useMemo(() => {
    const maxCount = difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 10;
    return Math.min(round.count, maxCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCount, difficulty]);

  const numOptions = difficulty === "easy" ? 3 : 4;
  const displayOptions = round.options.slice(0, numOptions);
  const displayOptionsWithCount = displayOptions.includes(displayCount)
    ? displayOptions
    : [...displayOptions.slice(0, numOptions - 1), displayCount].sort(() => Math.random() - 0.5);

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Count Objects" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12 gap-8">
        <div className="w-full bg-card rounded-[3rem] p-8 shadow-xl border-2 border-card-border min-h-[250px] flex flex-col justify-center">
          <p className="text-center text-2xl font-bold text-foreground mb-6">How many?</p>
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: displayCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05, type: "spring" }}
                className="text-5xl"
              >
                {round.emoji}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full flex justify-center gap-4">
          {displayOptionsWithCount.map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAnswer(opt === displayCount)}
              disabled={!!feedback}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-4xl font-black shadow-md border-4 border-white"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>

      <FeedbackOverlay feedback={feedback} />
    </div>
  );
}
