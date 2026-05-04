import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete, useShuffledQueue, MAX_ROUNDS } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";

const TEASERS = [
  { q: "Which is bigger?",        correct: "🐘", wrong: ["🐭", "🐱"] },
  { q: "Which can fly?",          correct: "🦅", wrong: ["🐶", "🐢"] },
  { q: "What comes after 3?",     correct: "4️⃣", wrong: ["2️⃣", "5️⃣"] },
  { q: "Which is hot?",           correct: "🔥", wrong: ["❄️", "⛄"] },
  { q: "Which is green?",         correct: "🐸", wrong: ["🍎", "🍌"] },
  { q: "Which is a fruit?",       correct: "🍎", wrong: ["🥕", "🍔"] },
  { q: "Which swims in water?",   correct: "🐟", wrong: ["🦊", "🐦"] },
  { q: "Which is a number?",      correct: "7️⃣", wrong: ["🔴", "⭐"] },
  { q: "Which gives us milk?",    correct: "🐄", wrong: ["🐶", "🦊"] },
  { q: "Which shines at night?",  correct: "🌙", wrong: ["☀️", "🌈"] },
];

export default function BrainTeaser() {
  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(CreateCompletionBodyActivityType.brain_teaser);

  const queue = useShuffledQueue(TEASERS.slice(0, MAX_ROUNDS));
  const teaser = queue[Math.min(roundCount, queue.length - 1)];

  const options = useMemo(() => {
    const numOptions = difficulty === "easy" ? 2 : 3;
    const wrongs = teaser.wrong.slice(0, numOptions - 1);
    return [...[{ id: "c", emoji: teaser.correct, isCorrect: true },
      ...wrongs.map((e, i) => ({ id: `w${i}`, emoji: e, isCorrect: false }))]
    ].sort(() => Math.random() - 0.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCount, difficulty]);

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Brain Teaser" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12 gap-8">
        <div className="w-full bg-card rounded-[3rem] p-10 shadow-xl border-2 border-card-border text-center min-h-[200px] flex items-center justify-center">
          <h2 className="text-4xl font-black text-foreground leading-tight">{teaser.q}</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-6 w-full">
          {options.map((option) => (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAnswer(option.isCorrect)}
              disabled={!!feedback}
              className="flex-1 min-w-[120px] h-32 bg-muted rounded-3xl flex items-center justify-center text-6xl hover:bg-muted-foreground/10 transition-colors shadow-md border-4 border-white"
            >
              {option.emoji}
            </motion.button>
          ))}
        </div>
      </div>

      <FeedbackOverlay feedback={feedback} />
    </div>
  );
}
