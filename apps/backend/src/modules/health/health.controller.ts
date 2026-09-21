import type { Request, Response } from "express";

export const healthCheck = (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "LibasTalentSpark API",
    timestamp: new Date().toISOString(),
  });
};
