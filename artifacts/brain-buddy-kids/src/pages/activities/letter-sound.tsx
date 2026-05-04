import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete, useShuffledQueue, MAX_ROUNDS } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";

const DATA = [
  { letter: "A", items: ["🍎", "🐜", "🚑"],       wrong: ["🚗", "🐶", "🍌"] },
  { letter: "B", items: ["🍌", "🐻", "🎈"],       wrong: ["🍎", "🐱", "☀️"] },
  { letter: "C", items: ["🐱", "🚗", "🥕"],       wrong: ["🐶", "🍎", "🎈"] },
  { letter: "D", items: ["🐶", "🍩", "🚪"],       wrong: ["🐱", "🍎", "🚗"] },
  { letter: "E", items: ["🐘", "🥚", "👁️"],      wrong: ["🐶", "🍌", "🚗"] },
  { letter: "F", items: ["🦊", "🐸", "🔥"],       wrong: ["🐱", "🍎", "🎈"] },
  { letter: "G", items: ["🍇", "🦒", "🎸"],       wrong: ["🐶", "🍌", "🚗"] },
  { letter: "H", items: ["🏠", "🐴", "🎧"],       wrong: ["🐱", "🍎", "🎈"] },
  { letter: "I", items: ["🍦", "🦎", "🎃"],       wrong: ["🐶", "🍌", "🚗"] },
  { letter: "J", items: ["🤹", "🫙", "🎷"],       wrong: ["🐱", "🍎", "🎈"] },
];

export default function LetterSound() {
  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(CreateCompletionBodyActivityType.letter_sound);

  const queue = useShuffledQueue(DATA.slice(0, MAX_ROUNDS));
  const entry = queue[Math.min(roundCount, queue.length - 1)];

  const options = useMemo(() => {
    const numOptions = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
    const correctEmoji = entry.items[Math.floor(Math.random() * entry.items.length)];
    const wrongEmojis = [...entry.wrong].sort(() => Math.random() - 0.5).slice(0, numOptions - 1);
    return [
      { id: "c", emoji: correctEmoji, isCorrect: true },
      ...wrongEmojis.map((e, i) => ({ id: `w${i}`, emoji: e, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCount, difficulty]);

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Letter Sounds" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12 gap-12">
        <div className="w-40 h-40 bg-primary text-primary-foreground rounded-[3rem] shadow-xl border-4 border-white flex items-center justify-center">
          <span className="text-8xl font-black">{entry.letter}</span>
        </div>

        <div className="w-full bg-card rounded-[3rem] p-8 shadow-md border-2 border-card-border">
          <p className="text-center text-xl font-bold text-muted-foreground mb-6">Starts with {entry.letter}...</p>
          <div className="flex flex-wrap justify-center gap-6">
            {options.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAnswer(option.isCorrect)}
                disabled={!!feedback}
                className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center text-6xl hover:bg-muted-foreground/10 transition-colors shadow-sm"
              >
                {option.emoji}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <FeedbackOverlay feedback={feedback} />
    </div>
  );
}
