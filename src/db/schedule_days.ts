import { gte } from "drizzle-orm";
import { db } from "@/db/connection";
import { ScheduleDay, scheduleDays } from "@/db/schema";



export async function getAllScheduleDays(day: Date) {
    const result = await db
        .select({ dates: scheduleDays.dates })
        .from(scheduleDays)
        .where(gte(scheduleDays.dates, day.toISOString()));

    return result.map((d) => ({ dates: new Date(d.dates) }));
}


export async function insertScheduleDays(days: ScheduleDay[]) {
    const result = await db
        .insert(scheduleDays)
        .values(days)
        .onConflictDoNothing()
        .returning();

    return result;
}