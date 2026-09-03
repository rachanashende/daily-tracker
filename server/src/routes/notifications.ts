import { Router } from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { todayStr, daysAgoStr, dateDiffDays } from "../utils/auth";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------
// GET /api/notifications  — computed notifications (no separate table;
// derived live from habits/tasks/goals so they're always accurate)
// ---------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const today = todayStr();
    const yesterday = daysAgoStr(1);

    const settings = await prisma.userSettings.findUnique({ where: { userId } });

    const notifications: { id: string; type: string; message: string; severity: string }[] = [];

    // 1. Daily reminder
    if (!settings || settings.dailyReminder) {
      notifications.push({
        id: "daily-reminder",
        type: "reminder",
        message: "🌸 Don't forget to log today's habits and study sessions!",
        severity: "info",
      });
    }

    // 2. Missed habit alerts — habits not completed yesterday that have a streak
    if (!settings || settings.missedHabitAlerts) {
      const habits = await prisma.habit.findMany({
        where: { userId, archived: false },
        include: { completions: { where: { date: { in: [yesterday, today] } } } },
      });

      for (const h of habits) {
        const completedYesterday = h.completions.some((c) => c.date === yesterday && c.completed);
        const completedToday = h.completions.some((c) => c.date === today && c.completed);
        if (!completedYesterday && !completedToday && h.currentStreak === 0 && h.longestStreak > 0) {
          notifications.push({
            id: `missed-${h.id}`,
            type: "missed_habit",
            message: `💔 You missed "${h.name}" yesterday — your streak reset. Start a new one today!`,
            severity: "warning",
          });
        } else if (!completedToday) {
          notifications.push({
            id: `pending-${h.id}`,
            type: "pending_habit",
            message: `🌷 "${h.name}" is still waiting for you today.`,
            severity: "info",
          });
        }
      }
    }

    // 3. Upcoming deadlines — tasks and goals due within 3 days
    if (!settings || settings.deadlineReminders) {
      const tasks = await prisma.task.findMany({
        where: { userId, status: { not: "Completed" }, dueDate: { not: null } },
      });
      for (const t of tasks) {
        if (!t.dueDate) continue;
        const diff = dateDiffDays(t.dueDate, today);
        if (diff >= 0 && diff <= 3) {
          notifications.push({
            id: `task-${t.id}`,
            type: "deadline",
            message:
              diff === 0
                ? `⏰ Task "${t.title}" is due today!`
                : `📌 Task "${t.title}" is due in ${diff} day${diff > 1 ? "s" : ""}.`,
            severity: diff === 0 ? "urgent" : "warning",
          });
        } else if (diff < 0) {
          notifications.push({
            id: `task-overdue-${t.id}`,
            type: "overdue",
            message: `🚨 Task "${t.title}" is overdue!`,
            severity: "urgent",
          });
        }
      }

      const goals = await prisma.goal.findMany({
        where: { userId, completed: false, deadline: { not: null } },
      });
      for (const g of goals) {
        if (!g.deadline) continue;
        const diff = dateDiffDays(g.deadline, today);
        if (diff >= 0 && diff <= 7) {
          notifications.push({
            id: `goal-${g.id}`,
            type: "goal_deadline",
            message: `🎯 Goal "${g.title}" deadline is in ${diff} day${diff !== 1 ? "s" : ""} (${g.progress}% done).`,
            severity: diff <= 2 ? "urgent" : "warning",
          });
        }
      }
    }

    res.json(notifications);
  })
);

export default router;
