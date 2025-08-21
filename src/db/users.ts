import { eq, sql } from "drizzle-orm";
import { db } from "@/db/connection";
import { User, users } from "@/db/schema";
import { firstOrUndefined } from "@/utils";

export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email));

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

export async function getUsers(facilityId: string) {
  const result = await db
    .select({
      userId: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      name: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as("name"),
      email: users.email,
      isAdmin: users.isAdmin,
    })
    .from(users)
    .where(eq(users.facilityId, facilityId));

  return result;
}
