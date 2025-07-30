import { db } from "@/db/connection";
import { Assignment, assignments } from "@/db/schema";
import { and, eq } from "drizzle-orm";


export type UserAssignment = {
    userId: string;
    shiftId: string;
    assignment: Assignment[];
}

export async function assignShiftToUser(schedule: UserAssignment) {
    return await db.transaction(async (tx) => {
        await tx.delete(assignments)
            .where(
                and(
                    eq(assignments.shiftId, schedule.shiftId),
                    eq(assignments.userId, schedule.userId)
                )
            )
            .returning();

        const shift = await tx
            .insert(assignments)
            .values(schedule.assignment)
            .returning();

        return shift;
    });
}