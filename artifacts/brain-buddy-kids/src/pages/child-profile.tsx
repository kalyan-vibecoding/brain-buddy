import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Edit2, Check, X } from "lucide-react";
import { useGetChild, useUpdateChild, useListCompletions } from "@workspace/api-client-react";
import { useChildContext } from "@/lib/child-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { getGetChildQueryKey } from "@workspace/api-client-react";

const AVATAR_COLORS = [
  "#F9A825", "#E53935", "#8E24AA", "#1E88E5",
  "#00897B", "#43A047", "#FB8C00", "#D81B60",
];

const AGE_LABELS: Record<number, string> = {
  4: "Beginner Explorer 🌱",
  5: "Word Adventurer 🚀",
  6: "Story Champion 📖",
  7: "Story Champion 📖",
  8: "Story Champion 📖",
};

export default function ChildProfile() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { activeChildId } = useChildContext();
  const { data: child, isLoading: childLoading } = useGetChild(activeChildId!, {
    query: { enabled: !!activeChildId, queryKey: getGetChildQueryKey(activeChildId!) }
  });
  const { data: completions, isLoading: completionsLoading } = useListCompletions(activeChildId!, {
    query: { enabled: !!activeChildId }
  });
  const updateChild = useUpdateChild();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState(5);
  const [color, setColor] = useState(AVATAR_COLORS[0]);

  function startEdit() {
    if (!child) return;
    setName(child.name);
    setAge(child.age);
    setColor(child.avatarColor ?? AVATAR_COLORS[0]);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function saveEdit() {
    if (!activeChildId) return;
    updateChild.mutate(
      { id: activeChildId, data: { name, age, avatarColor: color } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetChildQueryKey(activeChildId) });
          setEditing(false);
        },
      }
    );
  }

  const totalStars = completions?.reduce((s, c) => s + (c.stars ?? 0), 0) ?? 0;
  const totalSessions = completions?.length ?? 0;
  const activitiesPlayed = new Set(completions?.map(c => c.activityType)).size;
  const ageLabel = AGE_LABELS[child?.age ?? 5] ?? "Story Champion 📖";

  if (childLoading) {
    return (
      <div className="min-h-[100dvh] bg-background p-6">
        <Skeleton className="w-32 h-32 rounded-full mx-auto mb-6" />
        <Skeleton className="w-48 h-8 mx-auto mb-3" />
        <Skeleton className="w-64 h-6 mx-auto" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Child not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <div className="w-full flex items-center p-4 md:p-6 gap-4">
        <Button
          variant="outline" size="icon"
          className="rounded-full w-14 h-14 bg-white shadow-sm border-2 border-muted flex-shrink-0"
          onClick={() => setLocation("/activities")}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="flex-1 text-2xl font-black text-foreground">Profile</h1>
        {!editing && (
          <Button variant="outline" size="icon" className="rounded-full w-12 h-12" onClick={startEdit}>
            <Edit2 className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 w-full max-w-[480px] mx-auto px-4 pb-8 flex flex-col gap-6">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-3">
          {editing ? (
            <>
              <div className="flex gap-2 flex-wrap justify-center mb-2">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="w-10 h-10 rounded-full border-4 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: c === color ? "white" : "transparent", outline: c === color ? "3px solid #1E88E5" : "none" }}
                  />
                ))}
              </div>
              <div
                className="w-28 h-28 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-bold"
                style={{ backgroundColor: color }}
              >
                {name.charAt(0).toUpperCase() || "?"}
              </div>
            </>
          ) : (
            <motion.div
              className="w-28 h-28 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white text-5xl font-bold"
              style={{ backgroundColor: child.avatarColor ?? AVATAR_COLORS[0] }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              {child.name.charAt(0).toUpperCase()}
            </motion.div>
          )}

          {editing ? (
            <div className="w-full flex flex-col gap-3">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Child's name"
                className="text-center text-xl font-bold h-14 rounded-2xl"
                maxLength={20}
              />
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm font-semibold text-muted-foreground">Age:</span>
                {[4, 5, 6, 7, 8].map(a => (
                  <button
                    key={a}
                    onClick={() => setAge(a)}
                    className={`w-10 h-10 rounded-full font-bold text-sm border-2 transition-colors ${
                      age === a ? "bg-primary text-white border-primary" : "bg-white border-muted text-foreground"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button className="flex-1 rounded-xl h-12" onClick={saveEdit} disabled={updateChild.isPending || !name.trim()}>
                  <Check className="w-4 h-4 mr-2" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-black text-foreground">{child.name}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-semibold">Age {child.age}</span>
                <span>·</span>
                <span>{ageLabel}</span>
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        {!editing && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Stars",     value: totalStars,    icon: "⭐" },
                { label: "Sessions",  value: totalSessions, icon: "🎮" },
                { label: "Activities",value: activitiesPlayed, icon: "🏅" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-muted flex flex-col items-center gap-1"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-2xl font-black text-foreground">{item.value}</span>
                  <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Level info */}
            <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
              <h3 className="font-black text-primary text-lg mb-1">Learning Level</h3>
              {child.age <= 4 && (
                <p className="text-sm text-foreground">At age 4, {child.name} reads <strong>2–3 letter words</strong> with phonics guides to help sound them out.</p>
              )}
              {child.age === 5 && (
                <p className="text-sm text-foreground">At age 5, {child.name} reads <strong>3–4 letter words</strong> including blends like "frog" and "ship".</p>
              )}
              {child.age >= 6 && (
                <p className="text-sm text-foreground">At age {child.age}, {child.name} reads <strong>short stories</strong> and answers comprehension questions.</p>
              )}
            </div>

            {/* Recent stars */}
            {completions && completions.length > 0 && (
              <div>
                <h3 className="font-black text-foreground text-lg mb-3">Recent Sessions</h3>
                <div className="flex flex-col gap-2">
                  {[...completions].slice(0, 5).map((c, i) => (
                    <div key={c.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm border border-muted">
                      <span className="text-sm font-semibold text-muted-foreground capitalize flex-1">{c.activityType?.replace(/_/g, " ")}</span>
                      <div className="flex">
                        {[1,2,3].map(n => (
                          <Star key={n} className={`w-4 h-4 ${n <= (c.stars ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href="/progress" className="w-full block">
              <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold border-2 border-primary/20">
                View Full Progress →
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
