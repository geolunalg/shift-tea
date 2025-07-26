import { NextFunction, Request, Response } from "express";
import { getBearerToken, validateJWT } from "@/api/middleware/tokens";
import { config } from "@/config";
import { User } from "@/db/schema";



export type SafeUser = Pick<User, "id">;

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.jwt.secret);

    req.user = { id: userId };

    next();
}