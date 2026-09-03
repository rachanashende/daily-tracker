import { Router } from "express";
import { body, param } from "express-validator";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

const VALID_PRIORITIES = ["Low", "Medium", "High"];
const VALID_STATUSES = ["Pending", "InProgress", "Completed"];

// ---------------------------------------------------------------------
// GET /api/tasks  — list (optional ?status=, ?priority=, ?dueDate=)
// ---------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, priority, dueDate } = req.query as Record<string, string>;

    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(dueDate ? { dueDate } : {}),
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });

    res.json(tasks);
  })
);

// ---------------------------------------------------------------------
// POST /api/tasks  — create
// ---------------------------------------------------------------------
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("priority").optional().isIn(VALID_PRIORITIES),
    body("status").optional().isIn(VALID_STATUSES),
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, priority, dueDate, status } = req.body;

    const task = await prisma.task.create({
      data: {
        userId: req.userId!,
        title,
        description,
        priority: priority || "Medium",
        dueDate,
        status: status || "Pending",
      },
    });

    res.status(201).json(task);
  })
);

// ---------------------------------------------------------------------
// PUT /api/tasks/:id  — edit
// ---------------------------------------------------------------------
router.put(
  "/:id",
  [param("id").notEmpty(), body("priority").optional().isIn(VALID_PRIORITIES), body("status").optional().isIn(VALID_STATUSES)],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Task not found.");

    const { title, description, priority, dueDate, status } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        priority,
        dueDate,
        status,
        completedAt: status === "Completed" ? new Date() : status ? null : undefined,
      },
    });

    res.json(task);
  })
);

// ---------------------------------------------------------------------
// PATCH /api/tasks/:id/complete  — quick toggle complete
// ---------------------------------------------------------------------
router.patch(
  "/:id/complete",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Task not found.");

    const nowCompleted = existing.status !== "Completed";

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        status: nowCompleted ? "Completed" : "Pending",
        completedAt: nowCompleted ? new Date() : null,
      },
    });

    res.json(task);
  })
);

// ---------------------------------------------------------------------
// DELETE /api/tasks/:id
// ---------------------------------------------------------------------
router.delete(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Task not found.");

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: "Task deleted." });
  })
);

export default router;
