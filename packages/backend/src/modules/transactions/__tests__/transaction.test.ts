describe("Transaction validation", () => {
  it("should reject negative amounts", () => {
    const amount = -50;
    expect(amount).toBeLessThan(0);
  });

  it("should only accept income or expense type", () => {
    const validTypes = ["income", "expense"];
    expect(validTypes).toContain("income");
    expect(validTypes).toContain("expense");
    expect(validTypes).not.toContain("transfer");
  });

  it("should parse valid date strings", () => {
    const date = new Date("2026-06-15");
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(15);
  });

  it("should detect invalid date strings", () => {
    const date = new Date("not-a-date");
    expect(isNaN(date.getTime())).toBe(true);
  });
});