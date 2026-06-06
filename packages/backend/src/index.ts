import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRouter from "./modules/auth/auth.router.js";

dotenv.config({ path: "../../.env" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});