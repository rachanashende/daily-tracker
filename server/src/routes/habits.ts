import { Router } from "express";
import { body, param } from "express-validator";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { todayStr, dateDiffDays } from "../utils/auth";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------
// GET /api/habits  — list all habits (with today's completion status)
// ---------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const today = todayStr();

    const habits = await prisma.habit.findMany({
      where: { userId: req.userId, archived: false },
      orderBy: { createdAt: "asc" },
      include: {
        completions: {
          where: { date: today },
        },
      },
    });

    const result = habits.map((h) => ({
      ...h,
      completedToday: h.completions.length > 0 && h.completions[0].completed,
      todayProgress: h.completions[0]?.progress ?? 0,
    }));

    res.json(result);
  })
);

// ---------------------------------------------------------------------
// GET /api/habits/:id  — single habit with full completion history
// ---------------------------------------------------------------------
router.get(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { completions: { orderBy: { date: "desc" }, take: 90 } },
    });
    if (!habit) throw new ApiError(404, "Habit not found.");
    res.json(habit);
  })
);

// ---------------------------------------------------------------------
// POST /api/habits  — create habit
// ---------------------------------------------------------------------
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("dailyTarget").optional().isInt({ min: 1 }),
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { name, description, category, dailyTarget, unit, icon, color } = req.body;

    const habit = await prisma.habit.create({
      data: {
        userId: req.userId!,
        name,
        description,
        category: category || "General",
        dailyTarget: dailyTarget || 1,
        unit: unit || "time(s)",
        icon: icon || "✨",
        color: color || "#f9a8d4",
      },
    });

    res.status(201).json(habit);
  })
);

// ---------------------------------------------------------------------
// PUT /api/habits/:id  — edit habit
// ---------------------------------------------------------------------
router.put(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new ApiError(404, "Habit not found.");

    const { name, description, category, dailyTarget, unit, icon, color, archived } = req.body;

    const habit = await prisma.habit.update({
      where: { id: req.params.id },
      data: { name, description, category, dailyTarget, unit, icon, color, archived },
    });

    res.json(habit);
  })
);

// ---------------------------------------------------------------------
// DELETE /api/habits/:id
// ---------------------------------------------------------------------
router.delete(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) throw new ApiError(404, "Habit not found.");

    await prisma.habit.delete({ where: { id: req.params.id } });
    res.json({ message: "Habit deleted." });
  })
);

// ---------------------------------------------------------------------
// POST /api/habits/:id/toggle  — toggle today's completion, recalc streaks
// body: { date?: "YYYY-MM-DD", progress?: number }
// ---------------------------------------------------------------------
router.post(
  "/:id/toggle",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const habit = await prisma.habit.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!habit) throw new ApiError(404, "Habit not found.");

    const date = req.body.date || todayStr();
    const progressInput = req.body.progress;

    const existingCompletion = await prisma.habitCompletion.findUnique({
      where: { habitId_date: { habitId: habit.id, date } },
    });

    let completion;
    if (existingCompletion) {
      // toggle off
      await prisma.habitCompletion.delete({ where: { id: existingCompletion.id } });
      completion = null;
    } else {
      const progress = progressInput ?? habit.dailyTarget;
      completion = await prisma.habitCompletion.create({
        data: {
          habitId: habit.id,
          date,
          progress,
          completed: progress >= habit.dailyTarget,
        },
      });
    }

    // Recalculate streaks from completion history
    const allCompletions = await prisma.habitCompletion.findMany({
      where: { habitId: habit.id, completed: true },
      orderBy: { date: "desc" },
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let runningStreak = 0;
    let prevDate: string | null = null;

    const today = todayStr();
    const sortedAsc = [...allCompletions].sort((a, b) => (a.date < b.date ? -1 : 1));

    for (const c of sortedAsc) {
      if (prevDate === null || dateDiffDays(c.date, prevDate) === 1) {
        runningStreak += 1;
      } else {
        runningStreak = 1;
      }
      longestStreak = Math.max(longestStreak, runningStreak);
      prevDate = c.date;
    }

    // current streak = consecutive days ending today or yesterday
    if (sortedAsc.length > 0) {
      const lastDate = sortedAsc[sortedAsc.length - 1].date;
      const gapFromToday = dateDiffDays(today, lastDate);
      if (gapFromToday <= 1) {
        currentStreak = runningStreak;
      } else {
        currentStreak = 0;
      }
    }

    const updatedHabit = await prisma.habit.update({
      where: { id: habit.id },
      data: { currentStreak, longestStreak },
    });

    res.json({ habit: updatedHabit, completion });
  })
);

export default router;
