import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import { generateToken } from "../../lib/jwt.js";

export async function registerUser(email: string, name: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  const token = generateToken(user.id);
  return { user: { id: user.id, email: user.email, name: user.name }, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user.id);
  return { user: { id: user.id, email: user.email, name: user.name }, token };
}