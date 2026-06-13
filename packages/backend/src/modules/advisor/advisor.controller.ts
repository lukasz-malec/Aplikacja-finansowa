import type { Response } from "express";
import type { AuthRequest } from "../../middleware/auth";
import { getQuickAnalysis, streamAdvice } from "./advisor.service";

export async function advise(req: AuthRequest, res: Response): Promise<void> {
  try {
    const targetSaving = req.query.targetSaving
      ? parseFloat(req.query.targetSaving as string)
      : undefined;
    const question = req.query.question as string | undefined;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const stream = streamAdvice({ userId: req.userId!, targetSaving, question });

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate advice" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
}

export async function quickAnalysis(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = await getQuickAnalysis(req.userId!);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate analysis" });
  }
}