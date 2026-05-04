import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, parentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterParentBody, LoginParentBody } from "@workspace/api-zod";
import { signToken } from "../lib/jwt";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterParentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;

  const [existing] = await db.select().from(parentsTable).where(eq(parentsTable.email, email));
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [parent] = await db.insert(parentsTable).values({ name, email, passwordHash }).returning();
  const token = signToken({ parentId: parent.id });

  res.status(201).json({
    id: parent.id,
    name: parent.name,
    email: parent.email,
    createdAt: parent.createdAt,
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginParentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [parent] = await db.select().from(parentsTable).where(eq(parentsTable.email, email));
  if (!parent) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, parent.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ parentId: parent.id });

  res.json({
    id: parent.id,
    name: parent.name,
    email: parent.email,
    createdAt: parent.createdAt,
    token,
  });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [parent] = await db.select().from(parentsTable).where(eq(parentsTable.id, req.parentId!));
  if (!parent) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    id: parent.id,
    name: parent.name,
    email: parent.email,
    createdAt: parent.createdAt,
    token: null,
  });
});

router.post("/auth/logout", (_req, res): void => {
  // JWT is stateless — client simply drops the token
  res.json({ success: true });
});

export default router;
