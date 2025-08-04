import cron from "node-cron";
import { getAllScheduleDays, insertScheduleDays } from "@/db/schedule_days";
import { config } from "@/config";

export async function generateDaysOfFullYear() {
  const today = new Date();
  const currMonth = today.getMonth();
  const currYear = today.getFullYear();

  const dates: Date[] = [];

  let year = currYear;
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
  const storedDates = await getAllScheduleDays(
    new Date(currYear, currMonth, 1),
  );
  const existingDatesSet = new Set(
    storedDates.map((d) => d.dates.toISOString()),
  );

  const insertDateVals = dates
    .filter((date) => !existingDatesSet.has(date.toISOString()))
    .map((day) => ({ dates: day.toISOString() }));

  // only store new dates if there are any
  if (insertDateVals.length > 0) {
    const insertedDates = await insertScheduleDays(insertDateVals);
    console.log(`schedule dates added: ${insertedDates.length}`);
  }
}

export function cronJobsSetup() {
  const firstOfMonth = config.cron.firstDayOfMonth;
  cron.schedule(
    firstOfMonth,
    async () => {
      try {
        await generateDaysOfFullYear();
      } catch (err) {
        console.log(err);
      }
    },
    {
      timezone: "America/Los_Angeles",
    },
  );
}
