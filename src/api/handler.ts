import type { Request, Response } from "express";
import { respondWithJSON } from "@/api/json.js";
import { hashPassword } from "@/api/auth.js";
import { Facility, User, users } from "@/db/schema.js";
import { AdminUser, createFacility } from "@/db/facilities.js";
import { omitParams } from "@/db/utils.js";

export function checkServerReadiness(req: Request, res: Response): void {
    respondWithJSON(res, 200, { status: "ok" })
}

export async function registerFacility(req: Request, res: Response) {
    type FacilityParams = {
        facilityName: string
    }
    type UserParams = {
        firstName: string,
        lastName: string,
        email: string,
        password: string,
        isAdmin: boolean
    }
    type Parameters = {
        facility: FacilityParams,
        user: UserParams
    }

    const params: Parameters = req.body;
    params.user.password = await hashPassword(params.user.password);

    const facility = await createFacility(
        params.facility satisfies Facility,
        params.user satisfies AdminUser
    );

    const newFacility = {
        facility: omitParams(facility.facility, ["deleteAt"]),
        users: omitParams(facility.user, ["deleteAt", "password"])
    };

    respondWithJSON(res, 200, newFacility);
}