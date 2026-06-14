import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "../../../lib/jwt";

describe("JWT", () => {
  it("should generate and verify a token", () => {
    const token = generateToken("user-123");
    const payload = verifyToken(token);
    expect(payload.userId).toBe("user-123");
  });

  it("should throw on invalid token", () => {
    expect(() => verifyToken("invalid-token")).toThrow();
  });

  it("should throw on expired token", () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ userId: "user-123" }, process.env.JWT_SECRET || "dev-secret-change-in-production", { expiresIn: "0s" });
    expect(() => verifyToken(token)).toThrow();
  });
});

describe("Password hashing", () => {
  it("should hash and compare password correctly", async () => {
    const password = "haslo123";
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });

  it("should reject wrong password", async () => {
    const hash = await bcrypt.hash("haslo123", 10);
    expect(await bcrypt.compare("wrong", hash)).toBe(false);
  });
});