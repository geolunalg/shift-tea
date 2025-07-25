import type { Request, Response } from "express";
import { respondWithJSON } from "@/api/json.js";
import { checkHashedPassword, makeJWT, makeRefreshToken } from "@/api/middleware/auth.js";
import { User } from "@/db/schema.js";
import { omitParams } from "@/utils.js";
import { getUserByEmail } from "@/db/users";
import { UserNotAuthenticatedError } from "@/api/errors";
import { config } from "@/config";
import { saveRefreshToken } from "@/db/refreshTokens";


export type UserResponse = Omit<User, "password" | "deleteAt">;
type LoginResponse = UserResponse & {
    token: string;
    refresh: string;
};

export async function userLogin(req: Request, res: Response) {
    type Parameters = {
        email: string,
        password: string
    }

    const params: Parameters = req.body;
    const user = await getUserByEmail(params.email);
    if (!user) {
        throw new UserNotAuthenticatedError("userLogin: User email not found");
    }

    const matched = await checkHashedPassword(params.password, user.password);
    if (!matched) {
        throw new UserNotAuthenticatedError("userLogin: Invalid password");
    }

    const accessToken = await makeJWT(user.id, config.jwt.tokenDuration, config.jwt.secret);
    const refreshToken = makeRefreshToken();

    const savedRefreshToken = await saveRefreshToken(user.id, refreshToken);
    if (!savedRefreshToken) {
        throw new UserNotAuthenticatedError("userLogin: User is not authenticated")
    }

    const userResponse: UserResponse = omitParams(user, ["password", "deleteAt"]);
    const loginResponse: LoginResponse = {
        ...userResponse,
        token: accessToken,
        refresh: refreshToken
    }

    respondWithJSON(res, 200, loginResponse);
}

export async function addUser(req: Request, res: Response) {
    respondWithJSON(res, 200, { OK: "ok" });
}