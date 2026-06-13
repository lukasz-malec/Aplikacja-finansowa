import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Category } from "./modules/categories/category.model";

const prisma = new PrismaClient();

const MONGO_URL = process.env.MONGO_URL || "mongodb://budget_user:budget_pass@localhost:27017/budget_db?authSource=admin";

async function seed() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to databases");

  // Czyszczenie
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.user.deleteMany();
  await Category.deleteMany();

  // Użytkownik
  const passwordHash = await bcrypt.hash("haslo123", 10);
  const user = await prisma.user.create({
    data: {
      email: "jan@test.com",
      name: "Jan Kowalski",
      passwordHash,
    },
  });
  console.log(`User: ${user.email}`);

  // Kategorie wydatków
  const expenseCategories = await Promise.all([
    Category.create({ userId: user.id, name: "Jedzenie", color: "#ef4444", type: "expense" }),
    Category.create({ userId: user.id, name: "Transport", color: "#f59e0b", type: "expense" }),
    Category.create({ userId: user.id, name: "Mieszkanie", color: "#8b5cf6", type: "expense" }),
    Category.create({ userId: user.id, name: "Rozrywka", color: "#3b82f6", type: "expense" }),
    Category.create({ userId: user.id, name: "Kino", color: "#ec4899", type: "expense", isProtected: true }),
    Category.create({ userId: user.id, name: "Zdrowie", color: "#10b981", type: "expense" }),
    Category.create({ userId: user.id, name: "Ubrania", color: "#6366f1", type: "expense" }),
    Category.create({ userId: user.id, name: "Edukacja", color: "#0ea5e9", type: "expense" }),
    Category.create({ userId: user.id, name: "Kawa", color: "#78716c", type: "expense" }),
  ]);

  // Kategorie przychodów
  const incomeCategories = await Promise.all([
    Category.create({ userId: user.id, name: "Wynagrodzenie",color: "#10b981", type: "income" }),
    Category.create({ userId: user.id, name: "Freelance", color: "#3b82f6", type: "income" }),
    Category.create({ userId: user.id, name: "Inne przychody",  color: "#f59e0b", type: "income" }),
  ]);

  console.log(`Categories: ${expenseCategories.length} expense, ${incomeCategories.length} income`);

  // Transakcje — 6 miesięcy wstecz
  const transactions = [];
  const now = new Date();

  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const month = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const year = month.getFullYear();
    const m = month.getMonth();

    // Wynagrodzenie
    transactions.push({
      userId: user.id,
      amount: 6500,
      type: "income",
      description: "Wynagrodzenie",
      date: new Date(year, m, 1),
      categoryId: incomeCategories[0]._id.toString(),
    });

    // Freelance (nie co miesiąc)
    if (monthOffset % 2 === 0) {
      transactions.push({
        userId: user.id,
        amount: 800 + Math.round(Math.random() * 1200),
        type: "income",
        description: "Projekt freelance",
        date: new Date(year, m, 15),
        categoryId: incomeCategories[1]._id.toString(),
      });
    }

    // Mieszkanie (stały)
    transactions.push({
      userId: user.id,
      amount: 2200,
      type: "expense",
      description: "Czynsz + media",
      date: new Date(year, m, 5),
      categoryId: expenseCategories[2]._id.toString(),
    });

    // Jedzenie (wiele transakcji)
    const foodCount = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < foodCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28);
      const descriptions = ["Biedronka", "Lidl", "Żabka", "Obiad w mieście", "Dostawa jedzenia", "Piekarnia", "Warzywniak", "Pizza na wynos"];
      transactions.push({
        userId: user.id,
        amount: Math.round((15 + Math.random() * 120) * 100) / 100,
        type: "expense",
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        date: new Date(year, m, day),
        categoryId: expenseCategories[0]._id.toString(),
      });
    }

    // Transport
    const transportCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < transportCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28);
      const descriptions = ["Paliwo", "Bilet MPK", "Uber", "Bolt", "Parking"];
      transactions.push({
        userId: user.id,
        amount: Math.round((10 + Math.random() * 150) * 100) / 100,
        type: "expense",
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        date: new Date(year, m, day),
        categoryId: expenseCategories[1]._id.toString(),
      });
    }

    // Rozrywka (trend rosnący)
    const entertainmentBase = 100 + (5 - monthOffset) * 30;
    const entertainmentCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < entertainmentCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28);
      const descriptions = ["Steam — gra", "PS Store", "Subskrypcja Xbox", "Gra planszowa"];
      transactions.push({
        userId: user.id,
        amount: Math.round((entertainmentBase / entertainmentCount + Math.random() * 50) * 100) / 100,
        type: "expense",
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        date: new Date(year, m, day),
        categoryId: expenseCategories[3]._id.toString(),
      });
    }

    // Kino (chronione)
    transactions.push({
      userId: user.id,
      amount: Math.round((35 + Math.random() * 30) * 100) / 100,
      type: "expense",
      description: "Bilety do kina",
      date: new Date(year, m, 10 + Math.floor(Math.random() * 10)),
      categoryId: expenseCategories[4]._id.toString(),
    });
    if (Math.random() > 0.4) {
      transactions.push({
        userId: user.id,
        amount: Math.round((35 + Math.random() * 30) * 100) / 100,
        type: "expense",
        description: "Kino — seans specjalny",
        date: new Date(year, m, 20 + Math.floor(Math.random() * 8)),
        categoryId: expenseCategories[4]._id.toString(),
      });
    }

    // Zdrowie (sporadycznie)
    if (Math.random() > 0.4) {
      transactions.push({
        userId: user.id,
        amount: Math.round((50 + Math.random() * 200) * 100) / 100,
        type: "expense",
        description: Math.random() > 0.5 ? "Apteka" : "Wizyta lekarska",
        date: new Date(year, m, Math.floor(Math.random() * 28) + 1),
        categoryId: expenseCategories[5]._id.toString(),
      });
    }

    // Kawa (codziennie prawie)
    const coffeeCount = 12 + Math.floor(Math.random() * 10);
    for (let i = 0; i < coffeeCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28);
      transactions.push({
        userId: user.id,
        amount: Math.round((8 + Math.random() * 12) * 100) / 100,
        type: "expense",
        description: Math.random() > 0.5 ? "Starbucks" : "Costa Coffee",
        date: new Date(year, m, day),
        categoryId: expenseCategories[8]._id.toString(),
      });
    }

    // Ubrania (raz na 2 miesiące)
    if (monthOffset % 2 === 1) {
      transactions.push({
        userId: user.id,
        amount: Math.round((100 + Math.random() * 300) * 100) / 100,
        type: "expense",
        description: "Zakupy odzieżowe",
        date: new Date(year, m, 15 + Math.floor(Math.random() * 10)),
        categoryId: expenseCategories[6]._id.toString(),
      });
    }
  }

  // Zapisz transakcje
  await prisma.transaction.createMany({ data: transactions });
  console.log(`Transactions: ${transactions.length}`);

  // Budżety na bieżący miesiąc
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await prisma.budget.createMany({
    data: [
      { userId: user.id, categoryId: expenseCategories[0]._id.toString(), amount: 800, month: currentMonth, year: currentYear },
      { userId: user.id, categoryId: expenseCategories[1]._id.toString(), amount: 400, month: currentMonth, year: currentYear },
      { userId: user.id, categoryId: expenseCategories[2]._id.toString(), amount: 2300, month: currentMonth, year: currentYear },
      { userId: user.id, categoryId: expenseCategories[3]._id.toString(), amount: 200, month: currentMonth, year: currentYear },
      { userId: user.id, categoryId: expenseCategories[8]._id.toString(), amount: 150, month: currentMonth, year: currentYear },
    ],
  });
  console.log("Budgets: 5");

  // Cele
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        name: "Wakacje w Grecji",
        targetAmount: 5000,
        currentAmount: 2350,
        deadline: new Date(currentYear, 7, 1),
      },
      {
        userId: user.id,
        name: "Nowy laptop",
        targetAmount: 4500,
        currentAmount: 1200,
        deadline: new Date(currentYear, 11, 1),
      },
      {
        userId: user.id,
        name: "Fundusz awaryjny",
        targetAmount: 10000,
        currentAmount: 6800,
        deadline: new Date(currentYear + 1, 5, 1),
      },
    ],
  });
  console.log("Goals: 3");

  console.log("\nSeed complete!");
  console.log("Login: jan@test.com / haslo123");

  await prisma.$disconnect();
  await mongoose.disconnect();
}

seed().catch(console.error);