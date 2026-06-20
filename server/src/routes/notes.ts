import { Router } from "express";
import { body, param } from "express-validator";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const router = Router();
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const notes = await prisma.note.findMany({
      where: { userId: req.userId },
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
    });
    res.json(notes);
  })
);

router.post(
  "/",
  [body("title").trim().notEmpty().withMessage("Title is required")],
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, content, color, pinned } = req.body;
    const note = await prisma.note.create({
      data: { userId: req.userId!, title, content: content || "", color: color || "#fde2f3", pinned: !!pinned },
    });
    res.status(201).json(note);
  })
);

router.put(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.note.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Note not found.");

    const { title, content, color, pinned } = req.body;
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: { title, content, color, pinned },
    });
    res.json(note);
  })
);

router.delete(
  "/:id",
  param("id").notEmpty(),
  validate,
  asyncHandler(async (req: AuthRequest, res) => {
    const existing = await prisma.note.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) throw new ApiError(404, "Note not found.");
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: "Note deleted." });
  })
);

export default router;
