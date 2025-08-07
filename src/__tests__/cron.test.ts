// Mocks must go before imports
vi.mock("@/db/scheduleDays", () => ({
  getAllScheduleDays: vi.fn(),
  insertScheduleDays: vi.fn(),
}));

vi.mock("@/config", () => ({
  config: {
    cron: {
      firstDayOfMonth: "0 0 1 * *",
    },
  },
}));

vi.mock("node-cron", () => ({
  default: {
    schedule: vi.fn(),
  },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateDaysOfFullYear, cronJobsSetup } from "@/cron";
import { getAllScheduleDays, insertScheduleDays } from "@/db/scheduleDays";
import { config } from "@/config";
import cron from "node-cron";

describe("generateDaysOfFullYear", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should insert missing dates from current month forward", async () => {
    const fixedDate = new Date("2025-08-01T00:00:00Z");
    vi.setSystemTime(fixedDate);

    const mockStoredDates = [
      { dates: new Date("2025-08-01T00:00:00.000Z") },
      { dates: new Date("2025-08-02T00:00:00.000Z") },
    ];
    (getAllScheduleDays as any).mockResolvedValue(mockStoredDates);
    (insertScheduleDays as any).mockResolvedValue([{ dates: "mock" }]);

    await generateDaysOfFullYear();

    expect(getAllScheduleDays).toHaveBeenCalledWith(new Date(2025, 7, 1)); // August is 7 (0-based)
    expect(insertScheduleDays).toHaveBeenCalled();
    const callArg = (insertScheduleDays as any).mock.calls[0][0];
    expect(callArg.every((d: any) => typeof d.dates === "string")).toBe(true);
  });

  it("should do nothing if all dates exist", async () => {
    // We're generating 365 day plus 31 days of August of next year.
    const futureDates = Array.from({ length: 365 + 31 }, (_, i) => {
      const date = new Date(2025, 7, 1); // August is 7 (0-based)
      date.setDate(date.getDate() + i);
      return { dates: date };
    });
    (getAllScheduleDays as any).mockResolvedValue(futureDates);
    (insertScheduleDays as any).mockResolvedValue([]);

    await generateDaysOfFullYear();

    expect(insertScheduleDays).not.toHaveBeenCalled();
  });
});

describe("cronJobsSetup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should schedule the cron job with correct expression and timezone", () => {
    cronJobsSetup();

    expect(cron.schedule).toHaveBeenCalledWith(
      config.cron.firstDayOfMonth,
      expect.any(Function),
      { timezone: "America/Los_Angeles" },
    );
  });
});
