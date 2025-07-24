import { config } from "@/config";
import { db } from "@/db/connection";
import { refreshTokens } from "@/db/schema";
import { eq } from "drizzle-orm";



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