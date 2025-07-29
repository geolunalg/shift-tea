import { BadRequestError } from "@/api/errors";
import { config } from "@/config";
import { db } from "@/db/connection";
import { users, refreshTokens } from "@/db/schema";
import { firstOrUndefined } from "@/utils";
import { and, eq, gt, isNull } from "drizzle-orm";



export async function saveRefreshToken(userId: string, token: string) {
    const result = await db
        .insert(refreshTokens)
        .values({
            token: token,
            userId: userId,
            expiresAt: new Date(Date.now() + config.jwt.refreshDuration),
            revokedAt: null
        }).returning();

    return result.length > 0;
}

export async function refreshUserToken(token: string) {
    const result = await db
        .select({ user: users })
        .from(users)
        .innerJoin(refreshTokens, eq(users.id, refreshTokens.userId))
        .where(
            and(
                eq(refreshTokens.token, token),
                isNull(refreshTokens.revokedAt),
                gt(refreshTokens.expiresAt, new Date()),
            ),
        )
        .limit(1);

    return firstOrUndefined(result);
}

export async function revokeRefreshToken(token: string) {
    const now = new Date();
    const rows = await db
        .update(refreshTokens)
        .set({
            revokedAt: now,
            expiresAt: now,
            updatedAt: now
        })
        .where(eq(refreshTokens.token, token))
        .returning();

    if (rows.length === 0) {
        throw new BadRequestError("Unable to find tokens");
    }
}