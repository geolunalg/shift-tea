import { BadRequestError } from "@/api/errors";
import { db } from "@/db/connection";
import { Assignment, assignments, scheduleDays, users } from "@/db/schema";
import { firstOrUndefined } from "@/utils";
import { and, eq } from "drizzle-orm";

export type UserAssignment = {
  userId: string;
  shiftId: string;
  assignment: Assignment[];
};

export async function assignShiftToUser(schedule: UserAssignment) {
  return await db.transaction(async (tx) => {
    const user = await tx
      .select()
      .from(users)
      .where(eq(users.id, schedule.userId));

    if (!firstOrUndefined(user)) {
      throw new BadRequestError("Staff member not found");
    }

    await tx
      .delete(assignments)
      .where(
        and(
          eq(assignments.shiftId, schedule.shiftId),
          eq(assignments.userId, schedule.userId),
        ),
      )
      .returning();

    if (schedule.assignment.length === 0) {
      return [];
    }

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
      scheduleDays: scheduleDays.dates,
    })
    .from(users)
    .innerJoin(assignments, eq(assignments.userId, users.id))
    .innerJoin(scheduleDays, eq(scheduleDays.id, assignments.scheduleDayId))
    .where(eq(assignments.shiftId, shiftId))
    .orderBy(users.id, scheduleDays.dates);

  return results;
}
