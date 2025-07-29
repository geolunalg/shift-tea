import type { Request, Response } from "express";
import { respondWithJSON } from "@/api/json.js";
import { checkHashedPassword, makeJWT, makeRefreshToken } from "@/api/middleware/tokens.js";
import { Facility, User } from "@/db/schema.js";
import { omitParams } from "@/utils.js";
import { createUser, getUserByEmail } from "@/db/users";
import { BadRequestError, UserNotAuthenticatedError } from "@/api/errors";
import { config } from "@/config";
import { saveRefreshToken } from "@/db/refreshTokens";
import { getFacilityByUserId } from "@/db/facilities";

export type UserParams = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    isAdmin: boolean
}

export type UserResponse = Omit<User, "password" | "deleteAt">;
type LoginResponse = UserResponse & {
    token: string;
    refresh: string;
}

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
    const userId = req.user?.id as string;

    const obj = await getFacilityByUserId(userId);
    if (!obj) {
        throw new BadRequestError("Facility not found");
    }
    const facility: Facility = obj.facility;

    function getTempPw() {
        // this is a tempory solution until I figure out
        // what I want to do with user created by and admin
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        const pw: string[] = [];
        for (let i = 0; i < 8; i++) {
            const randIdx = Math.floor(Math.random() * chars.length);
            pw.push(chars[randIdx]);
        }
        return pw.join("");
    }


    const userBody = req.body as UserResponse;

    if (typeof facility.id !== "string") {
        throw new BadRequestError("Facility id undefined");
    }

    const newUser: User = {
        ...userBody,
        password: getTempPw(),
        facilityId: facility.id
    }

    const user = await createUser(newUser satisfies User);
    if (!user) {
        throw new BadRequestError("Failed to creat user");
    }

    const userResponse: UserResponse = omitParams(user, ["password", "deleteAt"]);

    respondWithJSON(res, 200, userResponse);
}