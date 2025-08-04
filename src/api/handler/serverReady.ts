import type { Request, Response } from "express";
import { respondWithJSON } from "@/api/json.js";

export function checkServerReadiness(req: Request, res: Response): void {
  respondWithJSON(res, 200, { status: "ok" });
}

export function apiVersion1(req: Request, res: Response) {
  return respondWithJSON(res, 200, {
    message: "Welcome to the API",
    version: "1.0.0",
    status: "OK",
  });
}
