import { Router, type IRouter } from "express";
import { db, completionsTable, badgesTable, childrenTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateCompletionBody, ListCompletionsParams, CreateCompletionParams } from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

const BADGE_MILESTONES: Record<number, string> = {
  5: "first_five",
  10: "explorer",
  25: "champion",
  50: "master",
  100: "legend",
};

async function verifyChild(childId: number, parentId: number): Promise<boolean> {
  const [child] = await db.select().from(childrenTable).where(
    and(eq(childrenTable.id, childId), eq(childrenTable.parentId, parentId))
  );
  return !!child;
}

router.get("/children/:childId/completions", requireAuth, async (req, res): Promise<void> => {
  const params = ListCompletionsParams.safeParse({ childId: req.params.childId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (!(await verifyChild(params.data.childId, req.parentId!))) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const completions = await db.select().from(completionsTable)
    .where(eq(completionsTable.childId, params.data.childId))
    .orderBy(completionsTable.completedAt);

  res.json(completions);
});

router.post("/children/:childId/completions", requireAuth, async (req, res): Promise<void> => {
  const params = CreateCompletionParams.safeParse({ childId: req.params.childId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateCompletionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (!(await verifyChild(params.data.childId, req.parentId!))) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const [completion] = await db.insert(completionsTable).values({
    childId: params.data.childId,
    ...parsed.data,
  }).returning();

  // Auto-award badges at milestones
  const allCompletions = await db.select().from(completionsTable)
    .where(eq(completionsTable.childId, params.data.childId));
  const totalCount = allCompletions.length;
  const badgeType = BADGE_MILESTONES[totalCount];
  if (badgeType) {
    await db.insert(badgesTable).values({ childId: params.data.childId, badgeType }).onConflictDoNothing();
  }

  res.status(201).json(completion);
});

export default router;
