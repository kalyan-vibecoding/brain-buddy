import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState, GameHeader, FeedbackOverlay, SessionComplete, useShuffledQueue, MAX_ROUNDS } from "@/components/game-utils";
import { CreateCompletionBodyActivityType } from "@workspace/api-client-react";
import { useGetChild } from "@workspace/api-client-react";
import { useChildContext } from "@/lib/child-context";
import { Volume2 } from "lucide-react";

// ─── Word Banks ──────────────────────────────────────────────────────────────

interface WordItem {
  emoji: string;
  word: string;
  phonetic: string;
  distractors: [string, string];
}

interface StoryItem {
  story: string;
  question: string;
  options: [string, string, string];
  answer: string;
}

const EASY_WORDS: WordItem[] = [
  { emoji: "🐱", word: "cat",  phonetic: "c · a · t",     distractors: ["bat", "rat"] },
  { emoji: "🐶", word: "dog",  phonetic: "d · o · g",     distractors: ["log", "hog"] },
  { emoji: "☀️", word: "sun",  phonetic: "s · u · n",     distractors: ["bun", "run"] },
  { emoji: "🎩", word: "hat",  phonetic: "h · a · t",     distractors: ["bat", "mat"] },
  { emoji: "🐷", word: "pig",  phonetic: "p · i · g",     distractors: ["big", "fig"] },
  { emoji: "🐝", word: "bee",  phonetic: "b · ee",        distractors: ["see", "fee"] },
  { emoji: "🛌", word: "bed",  phonetic: "b · e · d",     distractors: ["red", "fed"] },
  { emoji: "🚌", word: "bus",  phonetic: "b · u · s",     distractors: ["fuss", "gust"] },
  { emoji: "🐟", word: "fish", phonetic: "f · i · sh",    distractors: ["wish", "dish"] },
  { emoji: "🔑", word: "key",  phonetic: "k · ee",        distractors: ["bee", "see"] },
];

const MEDIUM_WORDS: WordItem[] = [
  { emoji: "🐸", word: "frog",  phonetic: "f · r · o · g",  distractors: ["grog", "blog"] },
  { emoji: "⛵", word: "ship",  phonetic: "sh · i · p",      distractors: ["chip", "drip"] },
  { emoji: "🚩", word: "flag",  phonetic: "f · l · a · g",  distractors: ["slag", "brag"] },
  { emoji: "🥁", word: "drum",  phonetic: "d · r · u · m",  distractors: ["plum", "glum"] },
  { emoji: "🦀", word: "crab",  phonetic: "c · r · a · b",  distractors: ["drab", "grab"] },
  { emoji: "🌱", word: "grow",  phonetic: "g · r · ow",      distractors: ["glow", "crow"] },
  { emoji: "🚂", word: "train", phonetic: "t · r · ai · n", distractors: ["grain", "brain"] },
  { emoji: "🧊", word: "cold",  phonetic: "c · ol · d",      distractors: ["bold", "fold"] },
  { emoji: "🌙", word: "moon",  phonetic: "m · oo · n",      distractors: ["boon", "soon"] },
  { emoji: "🍞", word: "bread", phonetic: "b · r · ea · d", distractors: ["tread", "dread"] },
];

const HARD_STORIES: StoryItem[] = [
  {
    story: "Lily found a tiny blue egg in the garden. She watched it every day until a baby bird hatched out!",
    question: "What color was the egg?",
    options: ["red", "blue", "green"],
    answer: "blue",
  },
  {
    story: "Max and his dog Rex went to the park. Rex ran so fast he caught the frisbee every single time!",
    question: "What did Rex catch?",
    options: ["a ball", "a stick", "a frisbee"],
    answer: "a frisbee",
  },
  {
    story: "The little cloud was sad because she couldn't make rain. Then the sun taught her to make rainbows instead!",
    question: "What did the cloud learn to make?",
    options: ["snow", "rainbows", "thunder"],
    answer: "rainbows",
  },
  {
    story: "Zara baked six cookies for her friends. She gave two to Sam and two to Mia. How many were left?",
    question: "How many cookies were left?",
    options: ["one", "two", "three"],
    answer: "two",
  },
  {
    story: "The brave little turtle climbed all the way to the top of the hill. From up there she could see the whole ocean!",
    question: "What did the turtle see from the top?",
    options: ["a forest", "the ocean", "a village"],
    answer: "the ocean",
  },
  {
    story: "Ben mixed red and blue paint together. He was surprised when his brush turned purple!",
    question: "What color did Ben make?",
    options: ["green", "orange", "purple"],
    answer: "purple",
  },
  {
    story: "Sam had three red balloons. The wind blew one away. Now Sam counts his balloons again.",
    question: "How many balloons does Sam have now?",
    options: ["one", "two", "three"],
    answer: "two",
  },
  {
    story: "Ella the cat loved to climb trees. One sunny day she climbed up but couldn't get down! A kind firefighter helped her.",
    question: "Who helped Ella get down?",
    options: ["a teacher", "a firefighter", "her mom"],
    answer: "a firefighter",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function speakWord(text: string) {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WordRound({ item, onAnswer }: { item: WordItem; onAnswer: (correct: boolean) => void }) {
  const [options] = useState(() => [...[item.word, ...item.distractors]].sort(() => Math.random() - 0.5));
  const [chosen, setChosen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setChosen(null);
    setRevealed(false);
  }, [item]);

  function pick(opt: string) {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === item.word;
    if (correct) setRevealed(true);
    setTimeout(() => onAnswer(correct), 1000);
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <motion.div
        key={item.word}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-9xl select-none cursor-pointer"
        onClick={() => speakWord(item.word)}
      >
        {item.emoji}
      </motion.div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full"
          >
            <Volume2 className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary tracking-widest">{item.phonetic}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xl font-semibold text-muted-foreground">Which word matches?</p>

      <div className="flex gap-4 flex-wrap justify-center">
        {options.map((opt) => {
          const isChosen = chosen === opt;
          const isCorrect = opt === item.word;
          let bg = "bg-white border-muted";
          if (isChosen) bg = isCorrect ? "bg-green-100 border-green-500" : "bg-red-100 border-red-400";
          return (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => pick(opt)}
              className={`px-8 py-5 rounded-3xl border-4 text-2xl font-bold shadow-md transition-colors ${bg}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StoryRound({ item, onAnswer }: { item: StoryItem; onAnswer: (correct: boolean) => void }) {
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => { setChosen(null); }, [item]);

  function pick(opt: string) {
    if (chosen) return;
    setChosen(opt);
    setTimeout(() => onAnswer(opt === item.answer), 1100);
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-muted leading-relaxed">
        <p className="text-xl font-medium text-foreground">{item.story}</p>
      </div>
      <p className="text-xl font-bold text-center text-foreground">{item.question}</p>
      <div className="flex flex-col gap-3">
        {item.options.map((opt) => {
          const isChosen = chosen === opt;
          const isCorrect = opt === item.answer;
          let bg = "bg-white border-muted";
          if (isChosen) bg = isCorrect ? "bg-green-100 border-green-500" : "bg-red-100 border-red-400";
          return (
            <motion.button
              key={opt}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => pick(opt)}
              className={`w-full py-5 rounded-2xl border-4 text-xl font-bold shadow-sm ${bg}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReadingWords() {
  const { activeChildId } = useChildContext();
  const { data: child } = useGetChild(activeChildId!, {
    query: { enabled: !!activeChildId }
  });

  const age = child?.age ?? 5;
  const initialDifficulty = age <= 4 ? "easy" : age === 5 ? "medium" : "hard";

  const { difficulty, feedback, handleAnswer, isFinished, sessionDone, earnedStars, roundCount, totalRounds } = useGameState(
    CreateCompletionBodyActivityType.reading_words,
    initialDifficulty as "easy" | "medium" | "hard"
  );

  const easyQueue  = useShuffledQueue(EASY_WORDS.slice(0, MAX_ROUNDS));
  const mediumQueue = useShuffledQueue(MEDIUM_WORDS.slice(0, MAX_ROUNDS));
  const hardQueue  = useShuffledQueue(HARD_STORIES.slice(0, MAX_ROUNDS));

  const isStoryMode = difficulty === "hard";
  const idx = Math.min(roundCount, MAX_ROUNDS - 1);

  const currentWord  = easyQueue[idx];
  const currentMedium = mediumQueue[idx];
  const currentStory = hardQueue[idx];

  function onAnswer(correct: boolean) {
    handleAnswer(correct);
  }

  if (sessionDone || isFinished) return <SessionComplete stars={earnedStars} />;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center bg-background">
      <GameHeader title="Reading Words" roundCount={roundCount} totalRounds={totalRounds} />

      <div className="flex-1 w-full max-w-[480px] flex flex-col items-center justify-center p-6 pb-12 gap-4">
        <div className="w-full text-center mb-2">
          <span className="inline-block px-4 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
            {isStoryMode ? "Story Time 📖" : difficulty === "easy" ? "Beginner Words 🌱" : "Word Explorer 🚀"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {isStoryMode ? (
            <motion.div key={`story-${idx}`} className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StoryRound item={currentStory} onAnswer={onAnswer} />
            </motion.div>
          ) : (
            <motion.div key={`word-${idx}`} className="w-full flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WordRound item={difficulty === "easy" ? currentWord : currentMedium} onAnswer={onAnswer} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FeedbackOverlay feedback={feedback} />
    </div>
  );
}
