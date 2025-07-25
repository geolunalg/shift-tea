import type { Request, Response } from "express";
import { respondWithJSON } from "@/api/json.js";
import { hashPassword, } from "@/api/middleware/auth.js";
import { Facility } from "@/db/schema.js";
import { AdminUser, createFacility } from "@/db/facilities.js";
import { omitParams } from "@/utils.js";
import { UserResponse } from "./users";

type newFacility = {
    facility: FacilityResponse;
    user: UserResponse;
}

type FacilityResponse = Omit<Facility, "deleteAt">;

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

    const newFacility: newFacility = {
        facility: omitParams(facility.facility, ["deleteAt"]) satisfies FacilityResponse,
        user: omitParams(facility.user, ["deleteAt", "password"]) satisfies UserResponse
    };

    respondWithJSON(res, 200, newFacility);
}

