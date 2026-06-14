describe("Budget calculations", () => {
  it("should calculate percent used correctly", () => {
    const budget = 1000;
    const spent = 750;
    const percentUsed = Math.round((spent / budget) * 100);
    expect(percentUsed).toBe(75);
  });

  it("should detect budget exceeded", () => {
    const budget = 500;
    const spent = 650;
    const remaining = budget - spent;
    expect(remaining).toBeLessThan(0);
    expect(Math.abs(remaining)).toBe(150);
  });

  it("should handle zero budget", () => {
    const budget = 0;
    const spent = 100;
    const percentUsed = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    expect(percentUsed).toBe(0);
  });

  it("should calculate remaining correctly", () => {
    const budget = 2000;
    const spent = 1234.56;
    const remaining = budget - spent;
    expect(remaining).toBeCloseTo(765.44, 2);
  });

  it("should cap percent at over 100 when exceeded", () => {
    const budget = 500;
    const spent = 750;
    const percentUsed = Math.round((spent / budget) * 100);
    expect(percentUsed).toBe(150);
    expect(percentUsed).toBeGreaterThan(100);
  });
});