import { getAllScheduleDays, insertScheduleDays } from "@/db/schedule_days";


export async function generateDaysOfFullYear() {
    const today = new Date();
    const currMonth = today.getMonth();
    let year = today.getFullYear();

    const dates: Date[] = [];

    for (let i = 0; i <= 12; i++) {
        const month = (currMonth + i) % 12;
        if (month === 0 && i > 0) {
            year++;
        }

        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            dates.push(date);
        }
    }

    // getting all the dates the current month forward
    const storedDates = await getAllScheduleDays(new Date(year, 1, currMonth));
    const existingDatesSet = new Set(storedDates.map((d) => d.dates.toISOString()));

    const insertDateVals = dates
        .filter((date) => !existingDatesSet.has(date.toISOString()))
        .map((day) => ({ dates: day.toISOString() }));

    // only store new dates if there are any
    if (insertDateVals.length > 0) {
        const insertedDates = await insertScheduleDays(insertDateVals);
        console.log(`schedule dates added: ${insertedDates.length}`);
    }
}