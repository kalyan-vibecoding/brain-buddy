import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateCompletion, CreateCompletionBodyActivityType, CreateCompletionBodyDifficulty } from "@workspace/api-client-react";
import { useChildContext } from "@/lib/child-context";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { playCorrect, playCow, playCelebration } from "@/lib/sounds";

export const MAX_ROUNDS = 8;

export function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function useShuffledQueue<T>(items: T[]): T[] {
  return useState(() => shuffleArray(items))[0];
}

export function useGameState(
  activityType: CreateCompletionBodyActivityType,
  initialDifficulty: CreateCompletionBodyDifficulty = "medium"
) {
  const [, setLocation] = useLocation();
  const { activeChildId } = useChildContext();
  const createCompletion = useCreateCompletion();

  const [startTime] = useState(Date.now());
  const [difficulty, setDifficulty] = useState<CreateCompletionBodyDifficulty>(initialDifficulty);
  const [streak, setStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [roundCount, setRoundCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [sessionDone, setSessionDone] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleAnswer = (isCorrect: boolean) => {
    if (feedback) return;

    if (isCorrect) {
      playCorrect();
      setFeedback("correct");
      setStreak(s => s + 1);
      setWrongStreak(0);
      setCorrectCount(c => c + 1);
      if (streak + 1 >= 3 && difficulty === "easy")   setDifficulty("medium");
      if (streak + 1 >= 3 && difficulty === "medium") setDifficulty("hard");
    } else {
      playCow();
      setFeedback("wrong");
      setWrongStreak(w => w + 1);
      setStreak(0);
      if (wrongStreak + 1 >= 2 && difficulty === "hard")   setDifficulty("medium");
      if (wrongStreak + 1 >= 2 && difficulty === "medium") setDifficulty("easy");
    }

    setTimeout(() => {
      setFeedback(null);
      setRoundCount(r => r + 1);
    }, 1000);
  };

  useEffect(() => {
    if (roundCount >= MAX_ROUNDS && activeChildId && !sessionDone) {
      const stars = Math.min(3, Math.max(1,
        correctCount >= 7 ? 3 :
        correctCount >= 5 ? 2 : 1
      ));
      const durationSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

      setEarnedStars(stars);
      setSessionDone(true);
      playCelebration();

      createCompletion.mutate({
        data: {
          activityType,
          stars,
          difficulty,
          durationSeconds,
          correct: correctCount >= 4,
        }
      }, {
        onSuccess: () => setTimeout(() => setLocation("/activities"), 2800),
        onError:   () => setTimeout(() => setLocation("/activities"), 2800),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCount]);

  return {
    difficulty,
    feedback,
    handleAnswer,
    roundCount,
    totalRounds: MAX_ROUNDS,
    isFinished: roundCount >= MAX_ROUNDS,
    sessionDone,
    earnedStars,
    isPending: createCompletion.isPending,
    correctCount,
  };
}

// ─── Shuffled round progress dots ────────────────────────────────────────────

export function RoundProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i < current ? "bg-primary w-6" : i === current ? "bg-primary/40 w-4" : "bg-muted w-3"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Session complete overlay ─────────────────────────────────────────────────

export function SessionComplete({ stars }: { stars: number }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-primary to-blue-700"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ["#F9A825","#E53935","#43A047","#1E88E5","#FB8C00"][i % 5],
            left: `${(i * 19) % 100}%`,
            top: `${(i * 23) % 60}%`,
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: [0, 60, 120], opacity: [1, 1, 0] }}
          transition={{ delay: i * 0.08, duration: 1.5, ease: "easeIn" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="text-8xl mb-6"
      >
        🎉
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-black text-white mb-2 text-center"
      >
        All Done!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/80 text-xl mb-8"
      >
        Amazing work! 🌟
      </motion.p>

      <motion.div
        className="flex gap-3 mb-10"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        {[1, 2, 3].map(n => (
          <Star
            key={n}
            className={`w-14 h-14 drop-shadow-lg ${
              n <= stars ? "fill-amber-400 text-amber-400" : "fill-white/20 text-white/20"
            }`}
          />
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1] }}
        transition={{ delay: 0.6, duration: 1.5, repeat: Infinity }}
        className="text-white/70 text-base"
      >
        Going back to activities…
      </motion.p>
    </motion.div>
  );
}

// ─── Game header ──────────────────────────────────────────────────────────────

export function GameHeader({ title, roundCount, totalRounds }: {
  title: string;
  roundCount?: number;
  totalRounds?: number;
}) {
  const [, setLocation] = useLocation();
  return (
    <div className="w-full p-4 md:p-6 mb-2">
      <div className="flex items-center mb-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-12 h-12 bg-white shadow-sm border-2 border-muted"
          onClick={() => setLocation("/activities")}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="flex-1 text-center text-2xl font-bold text-foreground">{title}</h1>
        {roundCount !== undefined && totalRounds !== undefined && (
          <span className="text-sm font-bold text-muted-foreground w-12 text-right">
            {roundCount}/{totalRounds}
          </span>
        )}
      </div>
      {roundCount !== undefined && totalRounds !== undefined && (
        <RoundProgress current={roundCount} total={totalRounds} />
      )}
    </div>
  );
}

// ─── Feedback overlay ─────────────────────────────────────────────────────────

export function FeedbackOverlay({ feedback }: { feedback: "correct" | "wrong" | null }) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 bg-black/10 backdrop-blur-sm"
        >
          {feedback === "correct" ? (
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
              transition={{ duration: 0.5 }}
              className="bg-green-500 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center"
            >
              <Star className="w-24 h-24 fill-current mb-3" />
              <span className="text-4xl font-black">Great Job!</span>
            </motion.div>
          ) : (
            <motion.div
              animate={{ x: [-10, 10, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
              className="bg-orange-500 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center"
            >
              <span className="text-6xl mb-3">🐄</span>
              <span className="text-3xl font-bold">Try Again!</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
