import { db } from "@/db/connection";
import { Assignment, assignments, scheduleDays, shifts, users } from "@/db/schema";
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

export async function getShiftMembers(shiftId: string) {
    const results = await db
        .select({
            userId: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            shiftId: assignments.shiftId,
            scheduleDayId: assignments.scheduleDayId,
            scheduleDays: scheduleDays.dates
        }).from(users)
        .innerJoin(assignments, eq(assignments.userId, users.id))
        .innerJoin(scheduleDays, eq(scheduleDays.id, assignments.scheduleDayId))
        .where(eq(assignments.shiftId, shiftId))
        .orderBy(users.id, scheduleDays.dates);

    return results;
}