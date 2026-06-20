import { Router } from "express";
import bcrypt from "bcryptjs";
import { body } from "express-validator";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/auth";
import { validate } from "../middleware/validate";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { asyncHandler, ApiError } from "../middleware/errorHandler";

const router = Router();

// ---------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        settings: { create: {} }, // create default settings row
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  })
);

// ---------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  })
);

// ---------------------------------------------------------------------
// POST /api/auth/logout
// Stateless JWT — logout is handled client-side by deleting the token.
// This endpoint exists for symmetry / future token-blacklisting.
// ---------------------------------------------------------------------
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully." });
});

// ---------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { settings: true },
    });

    if (!user) throw new ApiError(404, "User not found.");

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      settings: user.settings,
    });
  })
);

export default router;
