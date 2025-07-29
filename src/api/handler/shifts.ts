import { Request, Response } from "express";
import { respondWithJSON } from "@/api/json";
import { getFacilityByUserId } from "@/db/facilities";
import { BadRequestError } from "@/api/errors";
import { Facility, Shift } from "@/db/schema";
import { createShift, getShift } from "@/db/shifts";


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
    }

    // TODO: assign schedules to users

    respondWithJSON(res, 200, { ok: "WIP: generateShifts" });
}


async function getUserShift(shift: Shift) {
    let obj = await getShift(shift);
    if (!obj) {
        obj = await createShift(shift);
    }
    return obj;
}