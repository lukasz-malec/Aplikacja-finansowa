import { predictNextMonth } from "../prediction.service";

describe("predictNextMonth", () => {
  it("should return 0 for empty history", () => {
    const result = predictNextMonth([]);
    expect(result).toBe(0);
  });

  it("should return same amount for single month", () => {
    const result = predictNextMonth([{ month: 1, year: 2026, amount: 500 }]);
    expect(result).toBe(500);
  });

  it("should predict increasing trend", () => {
    const history = [
      { month: 1, year: 2026, amount: 100 },
      { month: 2, year: 2026, amount: 200 },
      { month: 3, year: 2026, amount: 300 },
    ];
    const result = predictNextMonth(history);
    expect(result).toBeGreaterThan(300);
  });

  it("should predict decreasing trend", () => {
    const history = [
      { month: 1, year: 2026, amount: 300 },
      { month: 2, year: 2026, amount: 200 },
      { month: 3, year: 2026, amount: 100 },
    ];
    const result = predictNextMonth(history);
    expect(result).toBeLessThan(100);
  });

  it("should not return negative values", () => {
    const history = [
      { month: 1, year: 2026, amount: 50 },
      { month: 2, year: 2026, amount: 30 },
      { month: 3, year: 2026, amount: 10 },
    ];
    const result = predictNextMonth(history);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it("should predict stable for flat data", () => {
    const history = [
      { month: 1, year: 2026, amount: 500 },
      { month: 2, year: 2026, amount: 500 },
      { month: 3, year: 2026, amount: 500 },
    ];
    const result = predictNextMonth(history);
    expect(result).toBeCloseTo(500, 0);
  });
});