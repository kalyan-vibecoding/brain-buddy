import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Trophy, BookOpen, Shapes, EyeOff, Search, Hash, Blocks, Type, Brain } from "lucide-react";
import { useListCompletions, useGetChild } from "@workspace/api-client-react";
import { useChildContext } from "@/lib/child-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const ACTIVITY_META: Record<string, { name: string; icon: React.ElementType; color: string; bg: string }> = {
  match_shape:    { name: "Match Shape",   icon: Shapes,   color: "text-blue-600",   bg: "bg-blue-100" },
  odd_one_out:    { name: "Odd One Out",   icon: Search,   color: "text-purple-600", bg: "bg-purple-100" },
  memory_cards:   { name: "Memory Cards", icon: EyeOff,   color: "text-amber-600",  bg: "bg-amber-100" },
  count_objects:  { name: "Count Objects",icon: Hash,     color: "text-red-600",    bg: "bg-red-100" },
  pattern_builder:{ name: "Patterns",     icon: Blocks,   color: "text-green-600",  bg: "bg-green-100" },
  letter_sound:   { name: "Letters",      icon: Type,     color: "text-blue-600",   bg: "bg-blue-100" },
  brain_teaser:   { name: "Brain Teaser", icon: Brain,    color: "text-purple-600", bg: "bg-purple-100" },
  reading_words:  { name: "Reading Words",icon: BookOpen, color: "text-teal-600",   bg: "bg-teal-100" },
};

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`w-5 h-5 ${i <= count ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
    </div>
  );
}

export default function Progress() {
  const { activeChildId } = useChildContext();
  const { data: child } = useGetChild(activeChildId!, { query: { enabled: !!activeChildId } });
  const { data: completions, isLoading } = useListCompletions(activeChildId!, { query: { enabled: !!activeChildId } });

  // Aggregate by activity
  const stats = Object.keys(ACTIVITY_META).map((actId) => {
    const acts = completions?.filter(c => c.activityType === actId) ?? [];
    const maxStars = acts.length > 0 ? Math.max(...acts.map(c => c.stars ?? 0)) : 0;
    const totalStars = acts.reduce((s, c) => s + (c.stars ?? 0), 0);
    return { actId, plays: acts.length, maxStars, totalStars };
  });

  const totalPlays = stats.reduce((s, a) => s + a.plays, 0);
  const totalStars = stats.reduce((s, a) => s + a.totalStars, 0);
  const activitiesPlayed = stats.filter(a => a.plays > 0).length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <div className="w-full flex items-center p-4 md:p-6 gap-4">
        <Link href="/activities">
          <Button variant="outline" size="icon" className="rounded-full w-14 h-14 bg-white shadow-sm border-2 border-muted flex-shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-foreground">My Progress</h1>
          {child && <p className="text-muted-foreground">{child.name} · Age {child.age}</p>}
        </div>
        {child && (
          <div
            className="w-12 h-12 rounded-full border-4 border-white shadow flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ backgroundColor: child.avatarColor ?? "#F9A825" }}
          >
            {child.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[480px] mx-auto px-4 pb-8">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Activities", value: activitiesPlayed, icon: "🎮" },
            { label: "Sessions",   value: totalPlays,       icon: "🏅" },
            { label: "Stars",      value: totalStars,       icon: "⭐" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-muted flex flex-col items-center gap-1"
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-2xl font-black text-foreground">{item.value}</span>
              <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Trophy if played all */}
        {activitiesPlayed === 8 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 flex items-center gap-3"
          >
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <p className="font-bold text-amber-800">All Activities Unlocked!</p>
              <p className="text-sm text-amber-600">Keep playing to earn more stars!</p>
            </div>
          </motion.div>
        )}

        {/* Activity rows */}
        <h2 className="text-lg font-black text-foreground mb-3">Activity Progress</h2>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="w-full h-20 rounded-2xl" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.map((s, i) => {
              const meta = ACTIVITY_META[s.actId];
              const Icon = meta.icon;
              const pct = s.plays > 0 ? Math.min(100, (s.totalStars / (s.plays * 3)) * 100) : 0;
              return (
                <motion.div
                  key={s.actId}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-muted"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground truncate">{meta.name}</span>
                        <StarRow count={s.maxStars} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {s.plays === 0 ? "Not played yet" : `${s.plays} session${s.plays !== 1 ? "s" : ""} · Best: ${s.maxStars}⭐`}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: i * 0.05 + 0.3, duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
