import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "../errors";
import { decode } from "punycode";


const TOKEN_ISSUER = "simple-scheduler";

export async function hashPassword(password: string) {
    const saltRound = 10;
    return bcrypt.hash(password, saltRound);
}

export async function checkHashedPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function makeJWT(userId: string, expiresIn: number, secret: string) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = expiresIn + issuedAt;
    const token = jwt.sign({
        iss: TOKEN_ISSUER,
        sub: userId,
        iat: issuedAt,
        exp: expiresAt
    } satisfies Payload,
        secret, {
        algorithm: "HS256"
    });

    return token;
}

export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}

export function getBearerToken(req: Request) {
    const authorization = req.get("Authorization");
    if (!authorization) {
        throw new UserNotAuthenticatedError("Unauthorization user");
    }

    const token = authorization.split(" ");
    if (token.length < 2 || token[0] !== "Bearer") {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    }

    return token[1];
}

export function validateJWT(token: string, secret: string) {
    let payload: Payload;
    try {
        payload = jwt.verify(token, secret) as JwtPayload;
    } catch (err) {
        throw new UserNotAuthenticatedError("Cannot authenticate access");
    }

    if (payload.iss !== TOKEN_ISSUER) {
        throw new UserNotAuthenticatedError("Cannot authenticate application")
    }

    if (!payload.sub) {
        throw new UserNotAuthenticatedError("Cannot authenticate user")
    }

    return payload.sub;
}