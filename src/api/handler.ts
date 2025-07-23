import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";

export function checkServerReadiness(req: Request, res: Response): void {
    respondWithJSON(res, 200, { status: "ok" })
}

// export function registerFacility(req: Request, res: Response) {

// }