import { Router } from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { todayStr } from "../utils/auth";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------
// GET /api/dashboard  — today's summary for the dashboard page
// ---------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const today = todayStr();
    const userId = req.userId!;

    const [habits, todayCompletions, studyToday, tasks, goals] = await Promise.all([
      prisma.habit.findMany({ where: { userId, archived: false } }),
      prisma.habitCompletion.findMany({
        where: { habit: { userId }, date: today, completed: true },
      }),
      prisma.studySession.findMany({ where: { userId, date: today } }),
      prisma.task.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
    ]);

    const habitsCompletedToday = todayCompletions.length;
    const totalHabits = habits.length;
    const studyMinutesToday = studyToday.reduce((s, x) => s + x.duration, 0);

    const tasksToday = tasks.filter((t) => t.dueDate === today);
    const tasksCompletedToday = tasks.filter(
      (t) => t.status === "Completed" && t.completedAt && t.completedAt.toISOString().slice(0, 10) === today
    ).length;
    const tasksCompletedTotal = tasks.filter((t) => t.status === "Completed").length;

    // Overall completion % for today = average of habit completion rate + task completion rate
    const habitRate = totalHabits > 0 ? habitsCompletedToday / totalHabits : 0;
    const taskRate = tasksToday.length > 0 ? tasksToday.filter((t) => t.status === "Completed").length / tasksToday.length : null;

    const rates = [habitRate, ...(taskRate !== null ? [taskRate] : [])];
    const completionPercentage = rates.length
      ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100)
      : 0;

    const activeGoals = goals.filter((g) => !g.completed);
    const avgGoalProgress = activeGoals.length
      ? Math.round(activeGoals.reduce((s, g) => s + g.progress, 0) / activeGoals.length)
      : 0;

    res.json({
      date: today,
      habitsCompletedToday,
      totalHabits,
      studyMinutesToday,
      studyHoursToday: Math.round((studyMinutesToday / 60) * 10) / 10,
      tasksCompletedToday,
      tasksCompletedTotal,
      tasksDueToday: tasksToday.length,
      completionPercentage,
      activeGoalsCount: activeGoals.length,
      avgGoalProgress,
      habits: habits.slice(0, 5),
    });
  })
);

export default router;
