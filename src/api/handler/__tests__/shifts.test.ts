import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateShifts, getMonthShifts } from "@/api/handler/shifts"; // adjust path
import { BadRequestError } from "@/api/errors";
import { respondWithJSON } from "@/api/json";
import { getFacilityByUserId } from "@/db/facilities";
import { createShift, getShift, getShiftsForMonth } from "@/db/shifts";
import { getUserScheduleDays } from "@/db/scheduleDays";
import { assignShiftToUser, getShiftMembers } from "@/db/assignments";

// Mock all imports
vi.mock("@/api/json", () => ({
  respondWithJSON: vi.fn(),
}));
vi.mock("@/db/facilities", () => ({
  getFacilityByUserId: vi.fn(),
}));
vi.mock("@/db/shifts", () => ({
  getShift: vi.fn(),
  createShift: vi.fn(),
  getShiftsForMonth: vi.fn(),
}));
vi.mock("@/db/scheduleDays", () => ({
  getUserScheduleDays: vi.fn(),
}));
vi.mock("@/db/assignments", () => ({
  assignShiftToUser: vi.fn(),
  getShiftMembers: vi.fn(),
}));

describe("generateShifts", () => {
  const req: any = { body: {}, user: { id: "user-123" } };
  const res: any = {};
  beforeEach(() => {
    vi.clearAllMocks();
    (respondWithJSON as any).mockImplementation((_res, _code, data) => data);

    (getFacilityByUserId as any).mockResolvedValue({
      facility: { id: "fac-1" },
    });
    (getShift as any).mockResolvedValue({
      id: "shift-1",
      year: 2024,
      month: 5,
    });
    (createShift as any).mockResolvedValue({
      id: "shift-1",
      year: 2024,
      month: 5,
    });
    (getUserScheduleDays as any).mockResolvedValue([{ id: "day-1" }]);
    (assignShiftToUser as any).mockResolvedValue(undefined);
  });

  it("creates shifts and assigns staff successfully", async () => {
    req.body = {
      year: 2024,
      month: 5,
      shifts: [
        {
          startTime: "08:00",
          endTime: "16:00",
          staff: [{ userId: "u1", days: [1, 2] }],
        },
      ],
    };

    await generateShifts(req, res);

    expect(getFacilityByUserId).toHaveBeenCalledWith("user-123");
    expect(getShift).toHaveBeenCalled();
    expect(assignShiftToUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        shiftId: "shift-1",
      }),
    );
    expect(respondWithJSON).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ success: 1, failed: 0 }),
    );
  });

  it("throws BadRequestError if month is out of range", async () => {
    req.body = { year: 2024, month: 13, shifts: [] };
    await expect(generateShifts(req, res)).rejects.toThrow(BadRequestError);
  });

  it("throws BadRequestError if shift not found or created", async () => {
    (getShift as any).mockResolvedValue(null);
    (createShift as any).mockResolvedValue(null);

    req.body = {
      year: 2024,
      month: 5,
      shifts: [
        {
          startTime: "08:00",
          endTime: "16:00",
          staff: [{ userId: "u1", days: [1] }],
        },
      ],
    };
    await expect(generateShifts(req, res)).rejects.toThrow(
      "Unable to identify shift",
    );
  });

  it("handles failed shift assignment", async () => {
    (assignShiftToUser as any).mockRejectedValue(new Error("fail"));
    req.body = {
      year: 2024,
      month: 5,
      shifts: [
        {
          startTime: "08:00",
          endTime: "16:00",
          staff: [{ userId: "u1", days: [1] }],
        },
      ],
    };

    await generateShifts(req, res);
    (assignShiftToUser as any).mockRejectedValue(() => BadRequestError);

    expect(respondWithJSON).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({ failed: 1, failedUserId: ["u1"] }),
    );
  });
});

describe("getMonthShifts", () => {
  const req: any = { query: {}, user: { id: "user-123" } };
  const res: any = {};
  beforeEach(() => {
    vi.clearAllMocks();
    (respondWithJSON as any).mockImplementation((_res, _code, data) => data);
    (getFacilityByUserId as any).mockResolvedValue({
      facility: { id: "fac-1" },
    });
    (getShiftsForMonth as any).mockResolvedValue([
      { id: "shift-1", startTime: "08:00", endTime: "16:00" },
    ]);
    (getShiftMembers as any).mockResolvedValue([
      {
        userId: "u1",
        firstName: "John",
        lastName: "Doe",
        scheduleDays: new Date(2024, 5, 1),
      },
      {
        userId: "u1",
        firstName: "John",
        lastName: "Doe",
        scheduleDays: new Date(2024, 5, 2),
      },
    ]);
  });

  it("returns month shifts with grouped staff days", async () => {
    await getMonthShifts(req, res);

    expect(getFacilityByUserId).toHaveBeenCalledWith("user-123");
    expect(getShiftsForMonth).toHaveBeenCalled();
    expect(getShiftMembers).toHaveBeenCalledWith("shift-1");

    expect(respondWithJSON).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({
        shifts: [
          expect.objectContaining({
            staff: [
              expect.objectContaining({
                userId: "u1",
                days: expect.arrayContaining([1, 2]),
              }),
            ],
          }),
        ],
      }),
    );
  });

  it("uses provided year/month from query params", async () => {
    req.query = { year: "2023", month: "4" };
    await getMonthShifts(req, res);
    expect(getShiftsForMonth).toHaveBeenCalledWith(2023, 4, "fac-1");
  });
});
