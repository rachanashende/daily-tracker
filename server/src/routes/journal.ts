import { Router } from "express";
import { body, param } from "express-validator";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { todayStr } from "../utils/auth";

const router = Router();
router.use(requireAuth);

// GET /api/journal  — list entries (optional ?date=)
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const { date } = req.query as Record<string, string>;
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId, ...(date ? { date } : {}) },
      orderBy: { date: "desc" },
      take: 60,
    });
    res.json(entries);
  })
);

// POST /api/journal  — create/upsert today's (or given date's) entry
router.post(
  "/",
  [body("content").trim().notEmpty().withMessage("Journal content cannot be empty")],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { content, mood, date } = req.body;
    const entryDate = date || todayStr();

    const entry = await prisma.journalEntry.upsert({
      where: { userId_date: { userId: req.userId!, date: entryDate } },
      update: { content, mood },
      create: { userId: req.userId!, date: entryDate, content, mood },
    });

    res.status(201).json(entry);
  })
);

// DELETE /api/journal/:id
router.delete(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.journalEntry.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Journal entry not found.");
    await prisma.journalEntry.delete({ where: { id: req.params.id } });
    res.json({ message: "Journal entry deleted." });
  })
);

export default router;
