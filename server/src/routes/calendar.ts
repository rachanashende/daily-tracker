import { Router } from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------
// GET /api/calendar?month=YYYY-MM  — activity summary per day for month
// ---------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const start = `${month}-01`;
    const end = `${month}-31`;

    const [completions, sessions, tasks, goals] = await Promise.all([
      prisma.habitCompletion.findMany({
        where: { habit: { userId }, date: { gte: start, lte: end } },
        include: { habit: true },
      }),
      prisma.studySession.findMany({ where: { userId, date: { gte: start, lte: end } } }),
      prisma.task.findMany({ where: { userId, dueDate: { gte: start, lte: end } } }),
      prisma.goal.findMany({ where: { userId, deadline: { gte: start, lte: end } } }),
    ]);

    const days: Record<string, any> = {};

    const ensureDay = (date: string) => {
      if (!days[date]) {
        days[date] = { date, habits: [], studySessions: [], tasks: [], goals: [] };
      }
      return days[date];
    };

    for (const c of completions) {
      ensureDay(c.date).habits.push({
        id: c.habit.id,
        name: c.habit.name,
        icon: c.habit.icon,
        completed: c.completed,
      });
    }
    for (const s of sessions) {
      ensureDay(s.date).studySessions.push({
        id: s.id,
        subject: s.subject,
        topic: s.topic,
        duration: s.duration,
      });
    }
    for (const t of tasks) {
      if (!t.dueDate) continue;
      ensureDay(t.dueDate).tasks.push({ id: t.id, title: t.title, status: t.status, priority: t.priority });
    }
    for (const g of goals) {
      if (!g.deadline) continue;
      ensureDay(g.deadline).goals.push({ id: g.id, title: g.title, progress: g.progress, type: g.type });
    }

    res.json({ month, days });
  })
);

export default router;
