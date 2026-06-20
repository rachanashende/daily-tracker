import { Router } from "express";
import { body, param } from "express-validator";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

// ---------------------------------------------------------------------
// GET /api/goals  — list (optional ?type=short|long)
// ---------------------------------------------------------------------
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const { type } = req.query as Record<string, string>;

    const goals = await prisma.goal.findMany({
      where: { userId: req.userId, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" },
    });

    res.json(goals);
  })
);

// ---------------------------------------------------------------------
// POST /api/goals  — create
// ---------------------------------------------------------------------
router.post(
  "/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("type").optional().isIn(["short", "long"]),
    body("progress").optional().isInt({ min: 0, max: 100 }),
  ],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description, type, deadline, progress } = req.body;

    const goal = await prisma.goal.create({
      data: {
        userId: req.userId!,
        title,
        description,
        type: type || "short",
        deadline,
        progress: progress || 0,
        completed: (progress || 0) >= 100,
      },
    });

    res.status(201).json(goal);
  })
);

// ---------------------------------------------------------------------
// PUT /api/goals/:id  — edit (including progress updates)
// ---------------------------------------------------------------------
router.put(
  "/:id",
  [param("id").notEmpty(), body("progress").optional().isInt({ min: 0, max: 100 })],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Goal not found.");

    const { title, description, type, deadline, progress } = req.body;

    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        type,
        deadline,
        progress,
        completed: progress !== undefined ? progress >= 100 : undefined,
      },
    });

    res.json(goal);
  })
);

// ---------------------------------------------------------------------
// DELETE /api/goals/:id
// ---------------------------------------------------------------------
router.delete(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.goal.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Goal not found.");

    await prisma.goal.delete({ where: { id: req.params.id } });
    res.json({ message: "Goal deleted." });
  })
);

export default router;
