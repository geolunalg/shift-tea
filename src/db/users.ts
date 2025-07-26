import { eq } from "drizzle-orm";
import { db } from "@/db/connection";
import { User, users } from "@/db/schema";
import { firstOrUndefined } from "@/utils";


export async function getUserByEmail(email: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    return firstOrUndefined(result);
}

export async function createUser(user: User) {
    const result = await db
        .insert(users)
        .values(user)
        .onConflictDoNothing()
        .returning();

    return firstOrUndefined(result);
}