import { gte, inArray } from "drizzle-orm";
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
    if (days.length === 0) {
        return [];
    }

    const result = await db
        .insert(scheduleDays)
        .values(days)
        .onConflictDoNothing()
        .returning();

    return result;
}

export async function getUserScheduleDays(days: Date[]) {
    if (days.length === 0) {
        return [];
    }

    const dates = [];
    for (const day of days) {
        dates.push(day.toISOString().split('T')[0]);
    }

    const result = await db
        .select()
        .from(scheduleDays)
        .where(inArray(scheduleDays.dates, dates));

    return result;
}