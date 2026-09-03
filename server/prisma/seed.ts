import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  console.log("🌸 Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@dailytracker.app" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@dailytracker.app",
      passwordHash,
      settings: { create: { theme: "light" } },
    },
  });

  const habitsData = [
    { name: "Wake up before 7 AM", icon: "🌅", category: "Morning", color: "#fbcfe8" },
    { name: "Exercise", icon: "🏃‍♀️", category: "Health", color: "#fda4af" },
    { name: "Read a book", icon: "📖", category: "Learning", color: "#e9d5ff" },
    { name: "Drink 3 liters water", icon: "💧", category: "Health", dailyTarget: 3, unit: "liters", color: "#bae6fd" },
    { name: "Meditation", icon: "🧘‍♀️", category: "Mindfulness", color: "#fde68a" },
  ];

  for (const h of habitsData) {
    const habit = await prisma.habit.upsert({
      where: { id: `seed-${h.name}` },
      update: {},
      create: {
        id: `seed-${h.name}`,
        userId: user.id,
        name: h.name,
        icon: h.icon,
        category: h.category,
        dailyTarget: h.dailyTarget || 1,
        unit: h.unit || "time(s)",
        color: h.color,
      },
    });

    // seed some completions over the last 10 days
    for (let i = 9; i >= 0; i--) {
      if (Math.random() > 0.3) {
        const date = daysAgoStr(i);
        await prisma.habitCompletion.upsert({
          where: { habitId_date: { habitId: habit.id, date } },
          update: {},
          create: { habitId: habit.id, date, completed: true, progress: habit.dailyTarget },
        });
      }
    }
  }

  const subjects = ["ARM Architecture", "Algorithms", "DBMS", "Operating Systems"];
  for (let i = 13; i >= 0; i--) {
    const date = daysAgoStr(i);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    await prisma.studySession.create({
      data: {
        userId: user.id,
        subject,
        topic: "Chapter review",
        duration: 30 + Math.floor(Math.random() * 90),
        date,
        notes: "Felt productive today!",
      },
    });
  }

  await prisma.task.createMany({
    data: [
      { userId: user.id, title: "Finish ARM assignment", priority: "High", status: "Pending", dueDate: todayStr() },
      { userId: user.id, title: "Revise DBMS notes", priority: "Medium", status: "InProgress", dueDate: daysAgoStr(-2) },
      { userId: user.id, title: "Buy groceries", priority: "Low", status: "Completed", dueDate: daysAgoStr(1) },
    ],
  });

  await prisma.goal.createMany({
    data: [
      { userId: user.id, title: "Finish ARM syllabus", type: "short", deadline: daysAgoStr(-14), progress: 40 },
      { userId: user.id, title: "Score above 9 CGPA", type: "long", deadline: daysAgoStr(-180), progress: 65 },
    ],
  });

  console.log("✅ Seed complete! Login with demo@dailytracker.app / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
