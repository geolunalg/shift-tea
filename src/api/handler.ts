import type { Request, Response } from "express";
import { respondWithJSON } from "@/api/json.js";
import { checkHashedPassword, hashPassword, makeJWT, makeRefreshToken } from "@/api/auth.js";
import { Facility, User } from "@/db/schema.js";
import { AdminUser, createFacility } from "@/db/facilities.js";
import { omitParams } from "@/db/utils.js";
import { getUserByEmail } from "@/db/users";
import { UserNotAuthenticatedError } from "@/api/errors";
import { config } from "@/config";
import { saveRefreshToken } from "@/db/refreshTokens";


export function checkServerReadiness(req: Request, res: Response): void {
    respondWithJSON(res, 200, { status: "ok" })
}

export async function registerFacility(req: Request, res: Response) {
    type FacilityParams = {
        facilityName: string
    }
    type UserParams = {
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        isAdmin: boolean
    }
    type Parameters = {
        facility: FacilityParams,
        user: UserParams
    }

    const params: Parameters = req.body;
    params.user.password = await hashPassword(params.user.password);

    const facility = await createFacility(
        params.facility satisfies Facility,
        params.user satisfies AdminUser
    );

    const newFacility = {
        facility: omitParams(facility.facility, ["deleteAt"]),
        users: omitParams(facility.user, ["deleteAt", "password"])
    };

    respondWithJSON(res, 200, newFacility);
}

type UserResponse = Omit<User, "password" | "deleteAt">;
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