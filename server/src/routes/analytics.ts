import { Router } from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { daysAgoStr, todayStr } from "../utils/auth";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------
// GET /api/analytics/habits
// ---------------------------------------------------------------------
router.get(
  "/habits",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      include: { completions: true },
    });

    const monthAgo = daysAgoStr(30);

    const habitStats = habits.map((h) => {
      const completionsInMonth = h.completions.filter((c) => c.date >= monthAgo && c.completed);
      const completionRate = Math.round((completionsInMonth.length / 30) * 100);
      return {
        id: h.id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        completionRate,
      };
    });

    // monthly consistency: % of habits completed each day for last 30 days
    const monthlyConsistency: { date: string; rate: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = daysAgoStr(i);
      const totalPossible = habits.length;
      const completedCount = habits.filter((h) =>
        h.completions.some((c) => c.date === d && c.completed)
      ).length;
      monthlyConsistency.push({
        date: d,
        rate: totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0,
      });
    }

    res.json({ habitStats, monthlyConsistency });
  })
);

// ---------------------------------------------------------------------
// GET /api/analytics/study
// ---------------------------------------------------------------------
router.get(
  "/study",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const sessions = await prisma.studySession.findMany({ where: { userId } });

    const bySubject: Record<string, number> = {};
    for (const s of sessions) {
      bySubject[s.subject] = (bySubject[s.subject] || 0) + s.duration;
    }

    const weeklyTrend: { date: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = daysAgoStr(i);
      weeklyTrend.push({
        date: d,
        minutes: sessions.filter((s) => s.date === d).reduce((sum, s) => sum + s.duration, 0),
      });
    }

    const monthlyTrend: { date: string; minutes: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = daysAgoStr(i);
      monthlyTrend.push({
        date: d,
        minutes: sessions.filter((s) => s.date === d).reduce((sum, s) => sum + s.duration, 0),
      });
    }

    res.json({ bySubject, weeklyTrend, monthlyTrend, totalSessions: sessions.length });
  })
);

// ---------------------------------------------------------------------
// GET /api/analytics/productivity
// ---------------------------------------------------------------------
router.get(
  "/productivity",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const [tasks, goals, habits] = await Promise.all([
      prisma.task.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.habit.findMany({ where: { userId, archived: false }, include: { completions: true } }),
    ]);

    const tasksCompleted = tasks.filter((t) => t.status === "Completed").length;
    const tasksPending = tasks.filter((t) => t.status !== "Completed").length;
    const tasksByPriority = {
      Low: tasks.filter((t) => t.priority === "Low").length,
      Medium: tasks.filter((t) => t.priority === "Medium").length,
      High: tasks.filter((t) => t.priority === "High").length,
    };

    const goalsProgress = goals.map((g) => ({
      id: g.id,
      title: g.title,
      type: g.type,
      progress: g.progress,
      completed: g.completed,
    }));

    const today = todayStr();
    const monthAgo = daysAgoStr(30);
    const habitRate =
      habits.length > 0
        ? Math.round(
            (habits.reduce(
              (sum, h) => sum + h.completions.filter((c) => c.date >= monthAgo && c.completed).length,
              0
            ) /
              (habits.length * 30)) *
              100
          )
        : 0;

    const taskCompletionRate = tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;
    const avgGoalProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

    // overall productivity score = weighted average
    const productivityScore = Math.round(habitRate * 0.4 + taskCompletionRate * 0.3 + avgGoalProgress * 0.3);

    res.json({
      tasksCompleted,
      tasksPending,
      tasksByPriority,
      goalsProgress,
      habitConsistencyRate: habitRate,
      taskCompletionRate,
      avgGoalProgress,
      productivityScore,
      today,
    });
  })
);

export default router;
