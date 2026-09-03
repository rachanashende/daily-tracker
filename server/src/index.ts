import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth";
import habitRoutes from "./routes/habits";
import studyRoutes from "./routes/study";
import taskRoutes from "./routes/tasks";
import goalRoutes from "./routes/goals";
import dashboardRoutes from "./routes/dashboard";
import analyticsRoutes from "./routes/analytics";
import calendarRoutes from "./routes/calendar";
import settingsRoutes from "./routes/settings";
import notificationRoutes from "./routes/notifications";
import journalRoutes from "./routes/journal";
import notesRoutes from "./routes/notes";
import exportRoutes from "./routes/export";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "🌸 Daily Tracker API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/study", studyRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/export", exportRoutes);

// In production, serve the built React app from the client's dist folder
// and let it handle any non-/api route (client-side routing).
if (process.env.NODE_ENV === "production") {
  const clientDist = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🌸 Daily Tracker server running at http://localhost:${PORT}`);
});
