import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete, useShuffledQueue, MAX_ROUNDS } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";

const PATTERNS_2 = [
  ["🔴", "🔵"],
  ["⭐", "🌙"],
  ["🐶", "🐱"],
  ["🍎", "🍌"],
  ["🌸", "🌺"],
  ["🔷", "🔶"],
];

const PATTERNS_3 = [
  ["🚗", "🚕", "🚙"],
  ["🌸", "🌼", "🌻"],
  ["🍕", "🍔", "🌮"],
  ["🎵", "🎶", "🎸"],
];

export default function PatternBuilder() {
  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(CreateCompletionBodyActivityType.pattern_builder);

  const queue2 = useShuffledQueue(PATTERNS_2);
  const queue3 = useShuffledQueue(PATTERNS_3);

  const roundData = useMemo(() => {
    const isComplex = difficulty === "hard";
    const selectedPattern = isComplex
      ? queue3[roundCount % queue3.length]
      : queue2[roundCount % queue2.length];

    const repeats = difficulty === "easy" ? 2 : 3;
    let fullPattern: string[] = [];
    for (let i = 0; i < repeats; i++) fullPattern = [...fullPattern, ...selectedPattern];

    const mIndex = fullPattern.length - 1;
    const answer = fullPattern[mIndex];

    const allEmojis = [...new Set([...PATTERNS_2.flat(), ...PATTERNS_3.flat()])];
    const opts = new Set<string>([answer]);
    const optsCount = difficulty === "easy" ? 2 : 3;
    while (opts.size < optsCount) {
      opts.add(allEmojis[Math.floor(Math.random() * allEmojis.length)]);
    }

    return {
      pattern: fullPattern,
      missingIndex: mIndex,
      correctAnswer: answer,
      options: Array.from(opts).sort(() => Math.random() - 0.5),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCount, difficulty]);

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Pattern Builder" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12 gap-12">
        <div className="w-full bg-card rounded-[3rem] p-8 shadow-xl border-2 border-card-border">
          <p className="text-center text-2xl font-bold text-foreground mb-8">What comes next?</p>
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            {roundData.pattern.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-4xl sm:text-5xl"
              >
                {index === roundData.missingIndex ? "❓" : item}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {roundData.options.map((opt) => (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAnswer(opt === roundData.correctAnswer)}
              disabled={!!feedback}
              className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center text-5xl hover:bg-muted-foreground/10 transition-colors shadow-md border-4 border-white"
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
