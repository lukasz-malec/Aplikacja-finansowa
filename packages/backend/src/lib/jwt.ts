import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, SECRET) as { userId: string };
}