import { and, eq } from "drizzle-orm";
import { Shift, shifts } from "@/db/schema";
import { db } from "@/db/connection";
import { firstOrUndefined } from "@/utils";

export async function getShift(shift: Shift) {
  const result = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.facilityId, shift.facilityId),
        eq(shifts.year, shift.year),
        eq(shifts.month, shift.month),
        eq(shifts.startTime, shift.startTime),
        eq(shifts.endTime, shift.endTime),
      ),
    );

  return firstOrUndefined(result);
}

export async function createShift(shift: Shift) {
  const result = await db
    .insert(shifts)
    .values(shift)
    .onConflictDoNothing()
    .returning();

  return firstOrUndefined(result);
}

export async function getShiftsForMonth(
  year: number,
  month: number,
  facilityId: string,
) {
  const result = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.facilityId, facilityId),
        eq(shifts.year, year),
        eq(shifts.month, month),
      ),
    );

  return result;
}
