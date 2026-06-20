import { Router } from "express";
import { body, param } from "express-validator";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { todayStr, daysAgoStr } from "../utils/auth";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------
// GET /api/study  — list sessions (optional ?date=, ?subject=, ?limit=)
// ---------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const { date, subject, limit } = req.query as Record<string, string>;

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: req.userId,
        ...(date ? { date } : {}),
        ...(subject ? { subject } : {}),
      },
      orderBy: { date: "desc" },
      take: limit ? parseInt(limit) : 100,
    });

    res.json(sessions);
  })
);

// ---------------------------------------------------------------------
// GET /api/study/stats  — daily / weekly / monthly / subject-wise stats
// ---------------------------------------------------------------------
router.get(
  "/stats",
  asyncHandler(async (req: AuthRequest, res) => {
    const today = todayStr();
    const weekAgo = daysAgoStr(7);
    const monthAgo = daysAgoStr(30);

    const all = await prisma.studySession.findMany({ where: { userId: req.userId } });

    const sum = (arr: typeof all) => arr.reduce((s, x) => s + x.duration, 0);

    const todayMinutes = sum(all.filter((s) => s.date === today));
    const weekMinutes = sum(all.filter((s) => s.date >= weekAgo));
    const monthMinutes = sum(all.filter((s) => s.date >= monthAgo));

    const bySubject: Record<string, number> = {};
    for (const s of all) {
      bySubject[s.subject] = (bySubject[s.subject] || 0) + s.duration;
    }

    // last 7 days trend
    const trend: { date: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgoStr(i);
      trend.push({ date: d, minutes: sum(all.filter((s) => s.date === d)) });
    }

    // last 30 days monthly trend grouped by week
    const monthlyTrend: { date: string; minutes: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = daysAgoStr(i);
      monthlyTrend.push({ date: d, minutes: sum(all.filter((s) => s.date === d)) });
    }

    res.json({
      todayMinutes,
      weekMinutes,
      monthMinutes,
      bySubject,
      trend,
      monthlyTrend,
    });
  })
);

// ---------------------------------------------------------------------
// POST /api/study  — add session
// ---------------------------------------------------------------------
router.post(
  "/",
  [
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("duration").isInt({ min: 1 }).withMessage("Duration must be a positive number of minutes"),
    body("date").optional().isString(),
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { subject, topic, duration, notes, date } = req.body;

    const session = await prisma.studySession.create({
      data: {
        userId: req.userId!,
        subject,
        topic,
        duration,
        notes,
        date: date || todayStr(),
      },
    });

    res.status(201).json(session);
  })
);

// ---------------------------------------------------------------------
// PUT /api/study/:id  — edit session
// ---------------------------------------------------------------------
router.put(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.studySession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new ApiError(404, "Study session not found.");

    const { subject, topic, duration, notes, date } = req.body;

    const session = await prisma.studySession.update({
      where: { id: req.params.id },
      data: { subject, topic, duration, notes, date },
    });

    res.json(session);
  })
);

// ---------------------------------------------------------------------
// DELETE /api/study/:id
// ---------------------------------------------------------------------
router.delete(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.studySession.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new ApiError(404, "Study session not found.");

    await prisma.studySession.delete({ where: { id: req.params.id } });
    res.json({ message: "Study session deleted." });
  })
);

export default router;
