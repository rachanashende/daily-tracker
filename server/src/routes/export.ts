import { Router } from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: any) => {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------
// GET /api/export/csv?type=habits|study|tasks|goals
// ---------------------------------------------------------------------
router.get(
  "/csv",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const type = (req.query.type as string) || "study";

    let rows: Record<string, any>[] = [];
    let filename = "export.csv";

    if (type === "habits") {
      const habits = await prisma.habit.findMany({ where: { userId }, include: { completions: true } });
      rows = habits.map((h) => ({
        name: h.name,
        category: h.category,
        dailyTarget: h.dailyTarget,
        currentStreak: h.currentStreak,
        longestStreak: h.longestStreak,
        totalCompletions: h.completions.filter((c) => c.completed).length,
      }));
      filename = "habits_export.csv";
    } else if (type === "study") {
      const sessions = await prisma.studySession.findMany({ where: { userId }, orderBy: { date: "desc" } });
      rows = sessions.map((s) => ({
        date: s.date,
        subject: s.subject,
        topic: s.topic,
        durationMinutes: s.duration,
        notes: s.notes,
      }));
      filename = "study_sessions_export.csv";
    } else if (type === "tasks") {
      const tasks = await prisma.task.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      rows = tasks.map((t) => ({
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate,
      }));
      filename = "tasks_export.csv";
    } else if (type === "goals") {
      const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      rows = goals.map((g) => ({
        title: g.title,
        type: g.type,
        deadline: g.deadline,
        progress: g.progress,
        completed: g.completed,
      }));
      filename = "goals_export.csv";
    }

    const csv = toCsv(rows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  })
);

// ---------------------------------------------------------------------
// GET /api/export/backup  — full JSON backup of all user data
// ---------------------------------------------------------------------
router.get(
  "/backup",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;

    const [user, habits, studySessions, tasks, goals, journalEntries, notes, settings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, createdAt: true } }),
      prisma.habit.findMany({ where: { userId }, include: { completions: true } }),
      prisma.studySession.findMany({ where: { userId } }),
      prisma.task.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.journalEntry.findMany({ where: { userId } }),
      prisma.note.findMany({ where: { userId } }),
      prisma.userSettings.findUnique({ where: { userId } }),
    ]);

    const backup = {
      exportedAt: new Date().toISOString(),
      user,
      habits,
      studySessions,
      tasks,
      goals,
      journalEntries,
      notes,
      settings,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="daily_tracker_backup_${Date.now()}.json"`);
    res.json(backup);
  })
);

export default router;
