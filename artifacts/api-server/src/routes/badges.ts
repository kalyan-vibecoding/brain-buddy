import { Router, type IRouter } from "express";
import { db, badgesTable, childrenTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { ListBadgesParams } from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/children/:childId/badges", requireAuth, async (req, res): Promise<void> => {
  const params = ListBadgesParams.safeParse({ childId: req.params.childId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [child] = await db.select().from(childrenTable).where(
    and(eq(childrenTable.id, params.data.childId), eq(childrenTable.parentId, req.parentId!))
  );
  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  const badges = await db.select().from(badgesTable)
    .where(eq(badgesTable.childId, params.data.childId))
    .orderBy(badgesTable.earnedAt);

  res.json(badges);
});

export default router;
