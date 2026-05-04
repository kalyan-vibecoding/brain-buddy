import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete, useShuffledQueue, MAX_ROUNDS } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";

const CATEGORIES = [
  { name: "animals",   items: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐸"] },
  { name: "fruits",    items: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓"] },
  { name: "vehicles",  items: ["🚗", "🚕", "🚙", "🚌", "🏎️", "🚓", "🚑", "🚒"] },
  { name: "sports",    items: ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🥊"] },
  { name: "weather",   items: ["☀️", "🌧️", "⛄", "🌈", "🌊", "🌪️", "🌙", "❄️"] },
  { name: "food",      items: ["🍕", "🍔", "🌮", "🍣", "🥗", "🍦", "🍜", "🥪"] },
];

type RoundDef = { mainCat: number; oddCat: number; mainIdx: number[]; oddIdx: number };

function buildRounds(): RoundDef[] {
  const rounds: RoundDef[] = [];
  const pairs: [number, number][] = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4],
  ];
  pairs.forEach(([mc, oc], i) => {
    rounds.push({
      mainCat: mc,
      oddCat: oc,
      mainIdx: [(i * 3) % 8, (i * 3 + 1) % 8, (i * 3 + 2) % 8, (i * 3 + 4) % 8, (i * 3 + 5) % 8],
      oddIdx: (i * 2) % 8,
    });
  });
  return rounds;
}

const ALL_ROUNDS = buildRounds();

export default function OddOneOut() {
  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(CreateCompletionBodyActivityType.odd_one_out);

  const queue = useShuffledQueue(ALL_ROUNDS.slice(0, MAX_ROUNDS));
  const round = queue[Math.min(roundCount, queue.length - 1)];

  const options = useMemo(() => {
    const numOptions = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
    const mainItems = round.mainIdx.slice(0, numOptions - 1).map(idx => CATEGORIES[round.mainCat].items[idx]);
    const oddItem = CATEGORIES[round.oddCat].items[round.oddIdx];
    return [
      ...mainItems.map((emoji, i) => ({ id: `m${i}`, emoji, isOdd: false })),
      { id: "odd", emoji: oddItem, isOdd: true },
    ].sort(() => Math.random() - 0.5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundCount, difficulty]);

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Odd One Out" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12">
        <div className="w-full bg-card rounded-[3rem] p-8 shadow-xl border-2 border-card-border">
          <p className="text-center text-2xl font-bold text-foreground mb-8">Which one is different?</p>
          <div className="flex flex-wrap justify-center gap-4">
            {options.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAnswer(option.isOdd)}
                disabled={!!feedback}
                className="w-24 h-24 sm:w-28 sm:h-28 bg-muted rounded-3xl flex items-center justify-center text-5xl hover:bg-muted-foreground/10 transition-colors border-4 border-transparent focus:border-primary focus:outline-none shadow-sm"
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
