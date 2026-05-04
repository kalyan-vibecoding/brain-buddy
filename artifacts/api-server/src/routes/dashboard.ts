import { Router, type IRouter } from "express";
import { db, completionsTable, badgesTable, childrenTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { GetChildStatsParams, GetChildProgressParams } from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

const ACTIVITY_ORDER = [
  "match_shape", "odd_one_out", "memory_cards",
  "count_objects", "pattern_builder", "letter_sound", "brain_teaser", "reading_words",
];

async function verifyChild(childId: number, parentId: number): Promise<boolean> {
  const [child] = await db.select().from(childrenTable).where(
    and(eq(childrenTable.id, childId), eq(childrenTable.parentId, parentId))
  );
  return !!child;
}

router.get("/children/:childId/stats", requireAuth, async (req, res): Promise<void> => {
  const params = GetChildStatsParams.safeParse({ childId: req.params.childId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!(await verifyChild(params.data.childId, req.parentId!))) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const allCompletions = await db.select().from(completionsTable)
    .where(eq(completionsTable.childId, params.data.childId));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCompletions = allCompletions.filter(c => new Date(c.completedAt) >= today);

  const totalStars = allCompletions.reduce((s, c) => s + c.stars, 0);
  const starsToday = todayCompletions.reduce((s, c) => s + c.stars, 0);
  const timeSpentTodaySeconds = todayCompletions.reduce((s, c) => s + c.durationSeconds, 0);

  const activityMap: Record<string, { count: number; stars: number }> = {};
  for (const c of allCompletions) {
    if (!activityMap[c.activityType]) activityMap[c.activityType] = { count: 0, stars: 0 };
    activityMap[c.activityType].count++;
    activityMap[c.activityType].stars += c.stars;
  }

  let bestActivity: string | null = null;
  let bestStars = 0;
  for (const [type, data] of Object.entries(activityMap)) {
    if (data.stars > bestStars) { bestStars = data.stars; bestActivity = type; }
  }

  const suggestedNextActivity = ACTIVITY_ORDER.reduce((least, type) => {
    return (activityMap[type]?.count ?? 0) < (activityMap[least]?.count ?? 0) ? type : least;
  }, ACTIVITY_ORDER[0]);

  const recent = allCompletions.slice(-5);
  const recentCorrect = recent.filter(c => c.correct).length;
  let currentDifficulty = "easy";
  if (recentCorrect >= 4) currentDifficulty = "hard";
  else if (recentCorrect >= 2) currentDifficulty = "medium";

  let streakCorrect = 0;
  for (let i = allCompletions.length - 1; i >= 0; i--) {
    if (allCompletions[i].correct) streakCorrect++;
    else break;
  }

  const badges = await db.select().from(badgesTable)
    .where(eq(badgesTable.childId, params.data.childId));

  res.json({
    totalStars,
    totalActivities: allCompletions.length,
    activitiesToday: todayCompletions.length,
    starsToday,
    timeSpentTodaySeconds,
    bestActivity,
    suggestedNextActivity,
    currentDifficulty,
    streakCorrect,
    totalBadges: badges.length,
  });
});

router.get("/children/:childId/progress", requireAuth, async (req, res): Promise<void> => {
  const params = GetChildProgressParams.safeParse({ childId: req.params.childId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!(await verifyChild(params.data.childId, req.parentId!))) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const allCompletions = await db.select().from(completionsTable)
    .where(eq(completionsTable.childId, params.data.childId))
    .orderBy(completionsTable.completedAt);

  const recentCompletions = allCompletions.slice(-10).reverse();

  const activityMap: Record<string, { count: number; totalStars: number }> = {};
  for (const c of allCompletions) {
    if (!activityMap[c.activityType]) activityMap[c.activityType] = { count: 0, totalStars: 0 };
    activityMap[c.activityType].count++;
    activityMap[c.activityType].totalStars += c.stars;
  }
  const activityBreakdown = Object.entries(activityMap).map(([activityType, data]) => ({
    activityType,
    count: data.count,
    totalStars: data.totalStars,
    avgStars: data.count > 0 ? data.totalStars / data.count : 0,
  }));

  const weeklyStars: { date: string; stars: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const dayStars = allCompletions
      .filter(c => { const cd = new Date(c.completedAt); return cd >= d && cd < next; })
      .reduce((s, c) => s + c.stars, 0);
    weeklyStars.push({ date: d.toISOString().slice(0, 10), stars: dayStars });
  }

  res.json({ recentCompletions, activityBreakdown, weeklyStars });
});

export default router;
