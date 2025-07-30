import { Request, Response } from "express";
import { respondWithJSON } from "@/api/json";
import { getFacilityByUserId } from "@/db/facilities";
import { BadRequestError } from "@/api/errors";
import { Assignment, Facility, Shift } from "@/db/schema";
import { createShift, getShift } from "@/db/shifts";
import { getUserScheduleDays } from "@/db/schedule_days";
import { assignShiftToUser, UserAssignment } from "@/db/assignments";


type ShiftsParams = {
    year: number;
    month: number;
    shifts: UserShifts[];
}

type UserShifts = {
    startTime: string;
    endTime: string;
    staff: Staff[];
}

type Staff = {
    userId: string;
    days: number[];
}

type ShiftMember = {
    shiftId: string;
    year: number;
    month: number;
    userId: string;
    days: number[];
}

export async function generateShifts(req: Request, res: Response) {
    const userId = req.user?.id as string;

    const obj = await getFacilityByUserId(userId);
    if (!obj) {
        throw new BadRequestError("Facility not found");
    }

    const facility: Facility = obj.facility;
    if (typeof facility.id !== "string") {
        throw new BadRequestError("Facility not found");
    }

    const params: ShiftsParams = req.body;

    const shiftMembers: ShiftMember[] = [];

    for (const shift of params.shifts) {
        const shiftVals: Shift = {
            facilityId: facility.id,
            year: params.year,
            month: params.month,
            startTime: shift.startTime,
            endTime: shift.endTime
        }

        const userShift = await getUserShift(shiftVals);
        if (!userShift) {
            throw new BadRequestError("Unable to identify shift");
        }

        for (const member of shift.staff) {
            shiftMembers.push({
                shiftId: userShift.id,
                year: userShift.year,
                month: userShift.month,
                userId: member.userId,
                days: member.days
            })
        }
    }

    const userAssignments: UserAssignment[] = [];
    for (const member of shiftMembers) {
        const assigned = await prepareMemberShifts(member);
        userAssignments.push({
            userId: member.userId,
            shiftId: member.shiftId,
            assignment: assigned
        });
    }

    // create a map assignment Promise.allSettled()
    const schedules = userAssignments.map(assignment => ({
        assignment: assignment,
        promise: assignShiftToUser(assignment)
    }));
    const results = await Promise.allSettled(schedules);

    const response = { success: 0, failed: 0, failedUserId: [] as string[] };
    results.forEach((res, idx) => {
        const input = schedules[idx].assignment;
        if (res.status === "fulfilled") {
            response.success++;
        } else {
            response.failed++;
            response.failedUserId.push(input.userId)
        }
    });

    respondWithJSON(res, 200, response);
}


async function getUserShift(shift: Shift) {
    let obj = await getShift(shift);
    if (!obj) {
        obj = await createShift(shift);
    }
    return obj;
}

async function prepareMemberShifts(member: ShiftMember) {
    const dates: Date[] = [];

    for (const day of member.days) {
        const date = new Date(member.year, member.month, day);
        dates.push(date);
    }

    const days = await getUserScheduleDays(dates);

    const assignments: Assignment[] = [];
    for (const day of days) {
        assignments.push({
            userId: member.userId,
            shiftId: member.shiftId,
            scheduleDayId: day.id
        });
    }

    return assignments;
}