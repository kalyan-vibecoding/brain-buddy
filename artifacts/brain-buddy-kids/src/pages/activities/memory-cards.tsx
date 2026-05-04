import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";
import { useChildContext } from "@/lib/child-context";
import { useGetChild } from "@workspace/api-client-react";
import { playCorrect, playCow } from "@/lib/sounds";

const EMOJI_POOL = ["🌟", "🎈", "🎨", "🚀", "🐶", "🌺", "🌈", "🦋", "🍕", "🎵", "🐸", "🦄"];

export default function MemoryCards() {
  const { activeChildId } = useChildContext();
  const { data: child } = useGetChild(activeChildId!);

  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(CreateCompletionBodyActivityType.memory_cards);

  const [cards, setCards] = useState<{ id: string; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!isFinished && cards.length === 0) setupGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, isFinished]);

  const setupGame = () => {
    const isOlder = child && child.age >= 7;
    const numPairs = isOlder
      ? (difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5)
      : (difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4);
    const selected = [...EMOJI_POOL].sort(() => Math.random() - 0.5).slice(0, numPairs);
    const deck = [...selected, ...selected]
      .map(emoji => ({ id: Math.random().toString(), emoji, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setFlippedIndices([]);
    setIsLocked(false);
  };

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      const [a, b] = newFlipped;
      if (newCards[a].emoji === newCards[b].emoji) {
        playCorrect();
        setTimeout(() => {
          const matched = [...newCards];
          matched[a].isMatched = true;
          matched[b].isMatched = true;
          setCards(matched);
          setFlippedIndices([]);
          setIsLocked(false);
          if (matched.every(c => c.isMatched)) {
            handleAnswer(true);
            setTimeout(() => setCards([]), 1200);
          }
        }, 500);
      } else {
        playCow();
        setTimeout(() => {
          const reset = [...newCards];
          reset[a].isFlipped = false;
          reset[b].isFlipped = false;
          setCards(reset);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Memory Cards" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12">
        <div className="w-full bg-card rounded-[3rem] p-6 shadow-xl border-2 border-card-border">
          <p className="text-center text-xl font-bold text-muted-foreground mb-6">Find the pairs!</p>
          <div className="grid grid-cols-2 gap-4 justify-items-center max-w-[320px] mx-auto">
            {cards.map((card, index) => (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCardClick(index)}
                className="w-28 h-36 relative"
                style={{ perspective: "1000px" }}
              >
                <motion.div
                  className="w-full h-full absolute inset-0"
                  animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div
                    className="absolute inset-0 bg-primary rounded-2xl flex items-center justify-center border-4 border-primary-foreground/20"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="text-3xl text-white font-black">?</span>
                  </div>
                  <div
                    className={`absolute inset-0 rounded-2xl flex items-center justify-center border-4 ${card.isMatched ? "bg-green-100 border-green-400" : "bg-white border-muted"}`}
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <span className="text-5xl">{card.emoji}</span>
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <FeedbackOverlay feedback={feedback} />
    </div>
  );
}
