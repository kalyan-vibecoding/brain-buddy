import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useChildContext } from "@/lib/child-context";
import { useGetChild } from "@workspace/api-client-react";
import { getGetChildQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Shapes, EyeOff, Search, Hash, Blocks, Type, Brain, BookOpen, BarChart2, User } from "lucide-react";

const ACTIVITIES = [
  { id: "match-shape",     name: "Match Shape",   icon: Shapes,   color: "bg-blue-500" },
  { id: "odd-one-out",     name: "Odd One Out",   icon: Search,   color: "bg-purple-500" },
  { id: "memory-cards",    name: "Memory Cards",  icon: EyeOff,   color: "bg-amber-500" },
  { id: "count-objects",   name: "Count Objects", icon: Hash,     color: "bg-red-500" },
  { id: "pattern-builder", name: "Patterns",      icon: Blocks,   color: "bg-green-500" },
  { id: "letter-sound",    name: "Letters",       icon: Type,     color: "bg-blue-400" },
  { id: "brain-teaser",    name: "Brain Teaser",  icon: Brain,    color: "bg-purple-400" },
  { id: "reading-words",   name: "Reading Words", icon: BookOpen, color: "bg-teal-500" },
];

export default function ActivitiesList() {
  const { activeChildId } = useChildContext();
  const [, setLocation] = useLocation();

  const { data: child, isLoading } = useGetChild(activeChildId!, {
    query: { enabled: !!activeChildId, queryKey: getGetChildQueryKey(activeChildId!) }
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full bg-background p-6">
        <Skeleton className="w-full h-24 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="w-full h-32 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background p-4 md:p-6">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="flex items-center mb-6 pt-2 gap-3">
          <Link href="/select-child" className="p-3 bg-white rounded-full shadow-sm active:scale-95 transition-transform flex-shrink-0">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black text-foreground">Hi, {child?.name}!</h1>
            <p className="text-base font-bold text-muted-foreground">What should we play?</p>
          </div>
          {child && (
            <button
              onClick={() => setLocation("/child-profile")}
              className="w-14 h-14 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: child.avatarColor }}
            >
              {child.name.charAt(0)}
            </button>
          )}
        </div>

        {/* Quick links row */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setLocation("/progress")}
            className="flex-1 flex items-center justify-center gap-2 bg-white rounded-2xl py-3 shadow-sm border border-muted hover:bg-primary/5 transition-colors active:scale-95"
          >
            <BarChart2 className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-foreground">Progress</span>
          </button>
          <button
            onClick={() => setLocation("/child-profile")}
            className="flex-1 flex items-center justify-center gap-2 bg-white rounded-2xl py-3 shadow-sm border border-muted hover:bg-primary/5 transition-colors active:scale-95"
          >
            <User className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm text-foreground">Profile</span>
          </button>
        </div>

        {/* Age badge */}
        {child && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Your Level:</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {child.age <= 4 ? "Beginner Explorer 🌱" : child.age === 5 ? "Word Adventurer 🚀" : "Story Champion 📖"}
            </span>
          </div>
        )}

        {/* Activity grid */}
        <div className="flex flex-col gap-4 pb-8">
          {ACTIVITIES.map((activity, i) => (
            <motion.button
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => setLocation(`/activities/${activity.id}`)}
              className={`w-full h-28 rounded-3xl p-6 flex items-center gap-6 shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-white ${activity.color} border-b-4 border-black/10`}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <activity.icon className="w-9 h-9 text-white" />
              </div>
              <span className="text-2xl md:text-3xl font-bold tracking-tight text-left">
                {activity.name}
              </span>
              {activity.id === "reading-words" && (
                <span className="ml-auto text-xs font-bold bg-white/20 px-2 py-1 rounded-full">NEW</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
