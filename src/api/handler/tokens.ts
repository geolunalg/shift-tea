import { Request, Response } from "express";
import { getBearerToken, makeJWT } from "@/api/middleware/tokens";
import { respondWithJSON } from "@/api/json";
import { refreshUserToken, revokeRefreshToken } from "@/db/refreshTokens";
import { UserNotAuthenticatedError } from "@/api/errors";
import { config } from "@/config";

export async function refreshToken(req: Request, res: Response) {
    let refreshToken = getBearerToken(req);

    const obj = await refreshUserToken(refreshToken);
    if (!obj) {
        throw new UserNotAuthenticatedError("User is not authorized");
    }

    const newAccessToken = await makeJWT(
        obj.user.id,
        config.jwt.refreshDuration,
        config.jwt.secret
    );

    respondWithJSON(res, 200, { token: newAccessToken });
}

export async function revokeToken(req: Request, res: Response) {
    const refresToken = getBearerToken(req);
    await revokeRefreshToken(refresToken);
    respondWithJSON(res, 204, { ok: "OK" });
}