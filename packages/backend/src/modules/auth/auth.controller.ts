import type { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";
import type { AuthRequest } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      res.status(400).json({ error: "Email, name and password are required" });
      return;
    }

    const result = await registerUser(email, name, password);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    res.status(400).json({ error: message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const result = await loginUser(email, password);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: result.user });
  } catch (error) {
    res.status(401).json({ error: "Invalid credentials" });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
}