import { eq } from "drizzle-orm";
import { db } from "@/db/connection";
import { users } from "@/db/schema";
import { firstOrUndefined } from "./utils";




export async function getUserByEmail(email: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

    return firstOrUndefined(result);
}