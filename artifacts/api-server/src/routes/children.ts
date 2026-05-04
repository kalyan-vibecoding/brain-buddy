import { Router, type IRouter } from "express";
import { db, childrenTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateChildBody, UpdateChildBody, GetChildParams, UpdateChildParams, DeleteChildParams } from "@workspace/api-zod";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/children", requireAuth, async (req, res): Promise<void> => {
  const children = await db.select().from(childrenTable).where(eq(childrenTable.parentId, req.parentId!));
  res.json(children);
});

router.post("/children", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, age, avatarColor } = parsed.data;
  const [child] = await db.insert(childrenTable).values({
    parentId: req.parentId!,
    name,
    age,
    avatarColor: avatarColor ?? "#005FCC",
  }).returning();

  res.status(201).json(child);
});

router.get("/children/:childId", requireAuth, async (req, res): Promise<void> => {
  const params = GetChildParams.safeParse({ childId: req.params.childId });
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

  res.json(child);
});

router.patch("/children/:childId", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateChildParams.safeParse({ childId: req.params.childId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateChildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [child] = await db.update(childrenTable)
    .set(parsed.data)
    .where(and(eq(childrenTable.id, params.data.childId), eq(childrenTable.parentId, req.parentId!)))
    .returning();

  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  res.json(child);
});

router.delete("/children/:childId", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteChildParams.safeParse({ childId: req.params.childId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [child] = await db.delete(childrenTable)
    .where(and(eq(childrenTable.id, params.data.childId), eq(childrenTable.parentId, req.parentId!)))
    .returning();

  if (!child) {
    res.status(404).json({ error: "Child not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
