import { calculateSavingsPlan } from "../prediction.service";

const mockCategories = [
  { categoryId: "1", categoryName: "Jedzenie", isProtected: false, monthlyAverage: 800, trend: 10, lastMonthAmount: 820 },
  { categoryId: "2", categoryName: "Kino", isProtected: true, monthlyAverage: 100, trend: 0, lastMonthAmount: 100 },
  { categoryId: "3", categoryName: "Rozrywka", isProtected: false, monthlyAverage: 300, trend: 30, lastMonthAmount: 350 },
  { categoryId: "4", categoryName: "Transport", isProtected: false, monthlyAverage: 400, trend: -5, lastMonthAmount: 390 },
  { categoryId: "5", categoryName: "Kawa", isProtected: false, monthlyAverage: 200, trend: 15, lastMonthAmount: 220 },
];

describe("calculateSavingsPlan", () => {
  it("should not cut protected categories", () => {
    const plan = calculateSavingsPlan(mockCategories, 500);
    const cutCategories = plan.recommendations.map((r) => r.categoryName);
    expect(cutCategories).not.toContain("Kino");
  });

  it("should reach target when possible", () => {
    const plan = calculateSavingsPlan(mockCategories, 200);
    expect(plan.targetReached).toBe(true);
    expect(plan.totalSaved).toBeGreaterThanOrEqual(200);
    expect(plan.shortfall).toBe(0);
  });

  it("should report shortfall when target is too high", () => {
    const plan = calculateSavingsPlan(mockCategories, 10000);
    expect(plan.targetReached).toBe(false);
    expect(plan.shortfall).toBeGreaterThan(0);
  });

  it("should cut max 30% per category", () => {
    const plan = calculateSavingsPlan(mockCategories, 500);
    for (const rec of plan.recommendations) {
      const original = mockCategories.find((c) => c.categoryName === rec.categoryName);
      if (original) {
        expect(rec.suggestedCut).toBeLessThanOrEqual(original.monthlyAverage * 0.3 + 0.01);
      }
    }
  });

  it("should return empty recommendations for zero target", () => {
    const plan = calculateSavingsPlan(mockCategories, 0);
    expect(plan.targetReached).toBe(true);
    expect(plan.recommendations).toHaveLength(0);
  });

  it("should handle all categories protected", () => {
    const allProtected = mockCategories.map((c) => ({ ...c, isProtected: true }));
    const plan = calculateSavingsPlan(allProtected, 500);
    expect(plan.targetReached).toBe(false);
    expect(plan.recommendations).toHaveLength(0);
    expect(plan.shortfall).toBe(500);
  });

  it("should prioritize categories with highest average", () => {
    const plan = calculateSavingsPlan(mockCategories, 100);
    if (plan.recommendations.length > 0) {
      expect(plan.recommendations[0].categoryName).toBe("Jedzenie");
    }
  });
});