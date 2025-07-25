import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";


const TOKEN_ISSUER = "simple-scheduler";

export async function hashPassword(password: string) {
    const saltRound = 10;
    return bcrypt.hash(password, saltRound);
}

export async function checkHashedPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function makeJWT(userId: string, expiresIn: number, secret: string) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = expiresIn + issuedAt;
    const token = jwt.sign({
        iss: TOKEN_ISSUER,
        sub: userId,
        iat: issuedAt,
        exp: expiresAt
    } satisfies payload,
        secret, {
        algorithm: "HS256"
    });

    return token;
}

export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}