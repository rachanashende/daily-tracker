import { Router } from "express";
import { body } from "express-validator";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    let settings = await prisma.userSettings.findUnique({ where: { userId: req.userId } });
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId: req.userId! } });
    }
    res.json(settings);
  })
);

router.put(
  "/",
  [
    body("theme").optional().isIn(["light", "dark"]),
    body("dailyReminder").optional().isBoolean(),
    body("deadlineReminders").optional().isBoolean(),
    body("missedHabitAlerts").optional().isBoolean(),
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { theme, dailyReminder, dailyReminderTime, deadlineReminders, missedHabitAlerts } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.userId },
      update: { theme, dailyReminder, dailyReminderTime, deadlineReminders, missedHabitAlerts },
      create: {
        userId: req.userId!,
        theme: theme || "light",
        dailyReminder: dailyReminder ?? true,
        dailyReminderTime: dailyReminderTime || "08:00",
        deadlineReminders: deadlineReminders ?? true,
        missedHabitAlerts: missedHabitAlerts ?? true,
      },
    });

    res.json(settings);
  })
);

export default router;
