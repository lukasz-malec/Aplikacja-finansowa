import OpenAI from "openai";
import type { CategorySpending } from "./prediction.service";
import { calculateSavingsPlan, getMonthlySpendingHistory, getSpendingByCategories, predictNextMonth } from "./prediction.service";
import { prisma } from "../../lib/prisma";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

interface AdvisorContext {
  userId: string;
  targetSaving?: number;
  question?: string;
}

async function buildPromptContext(userId: string, targetSaving?: number) {
  const history = await getMonthlySpendingHistory(userId, 6);
  const predictedExpenses = predictNextMonth(history);
  const categorySpending = await getSpendingByCategories(userId, 3);

  const goals = await prisma.goal.findMany({ where: { userId } });
  const goalsInfo = goals.map((g: typeof goals[number]) => ({
    name: g.name,
    target: g.targetAmount.toNumber(),
    current: g.currentAmount.toNumber(),
    deadline: g.deadline.toISOString().split("T")[0],
  }));

  let savingsPlan = null;
  if (targetSaving) {
    savingsPlan = calculateSavingsPlan(categorySpending, targetSaving);
  }

  return {
    history,
    predictedExpenses,
    categorySpending,
    goals: goalsInfo,
    savingsPlan,
  };
}

function buildSystemPrompt() {
  return `Jesteś osobistym doradcą finansowym. Analizujesz dane finansowe użytkownika i dajesz konkretne, praktyczne porady po polsku.

Zasady:
- Mów konkretnie, podawaj liczby
- Jeśli kategoria jest oznaczona jako chroniona (isProtected), NIE sugeruj jej cięcia
- Bądź wspierający, ale szczery
- Formatuj odpowiedź z nagłówkami i punktami
- Podawaj kwoty w PLN`;
}

function buildUserPrompt(context: Awaited<ReturnType<typeof buildPromptContext>>) {
  let prompt = `Oto moje dane finansowe:

HISTORIA WYDATKÓW (ostatnie 6 miesięcy):
${context.history.map((h) => `- ${h.month}/${h.year}: ${h.amount} PLN`).join("\n")}

PROGNOZA NA NASTĘPNY MIESIĄC: ${context.predictedExpenses} PLN

WYDATKI WG KATEGORII (średnia miesięczna):
${context.categorySpending.map((c) => `- ${c.categoryName}: ${c.monthlyAverage} PLN/msc (trend: ${c.trend > 0 ? "+" : ""}${c.trend} PLN/msc)${c.isProtected ? " [CHRONIONA - nie ciąć]" : ""}`).join("\n")}`;

  if (context.goals.length > 0) {
    prompt += `\n\nMOJE CELE:
    ${context.goals.map((g: typeof context.goals[number]) => `- ${g.name}: ${g.current}/${g.target} PLN (deadline: ${g.deadline})`).join("\n")}`;
  }

  if (context.savingsPlan) {
      prompt += `\n\nPLAN OSZCZĘDNOŚCI (obliczony):
  ${context.savingsPlan.recommendations.map((r: typeof context.savingsPlan.recommendations[number]) => `- ${r.categoryName}: ciąć ${r.suggestedCut} PLN (z ${r.currentAmount} na ${r.newAmount})`).join("\n")}
  Łączne oszczędności: ${context.savingsPlan.totalSaved} PLN
  Cel osiągnięty: ${context.savingsPlan.targetReached ? "TAK" : "NIE, brakuje " + context.savingsPlan.shortfall + " PLN"}`;
    }

    return prompt;
  }

export async function* streamAdvice(context: AdvisorContext): AsyncGenerator<string> {
  const promptContext = await buildPromptContext(context.userId, context.targetSaving);

  let userMessage = buildUserPrompt(promptContext);

  if (context.question) {
    userMessage += `\n\nMoje konkretne pytanie: ${context.question}`;
  } else {
    userMessage += "\n\nPrzeanalizuj moje finanse i daj mi konkretne porady. Co mogę poprawić? Gdzie widzisz ryzyko?";
  }

  const stream = await openai.chat.completions.create({
    model: "llama3.2",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userMessage },
    ],
    stream: true,
    max_tokens: 1500,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export async function getQuickAnalysis(userId: string) {
  const history = await getMonthlySpendingHistory(userId, 6);
  const predictedExpenses = predictNextMonth(history);
  const categorySpending = await getSpendingByCategories(userId, 3);

  return {
    predictedExpenses,
    categorySpending,
    spendingTrend: history,
  };
}