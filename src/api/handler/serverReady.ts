import type { Request, Response } from "express";
import { respondWithJSON } from "@/api/json.js";


export function checkServerReadiness(req: Request, res: Response): void {
    respondWithJSON(res, 200, { status: "ok" })
}
