import { db } from "@/db/connection";
import { User, Facility, facilities, users } from "@/db/schema";
import { firstOrUndefined, omitParams } from "@/db/utils";


export type NewFacility = {
    facility: Facility,
    user: User
}
export type AdminUser = Omit<User, "facilityId">;

export async function createFacility(newFacility: Facility, newAdmin: AdminUser): Promise<NewFacility> {

    const facilityEntry = await db
        .insert(facilities)
        .values(newFacility)
        .onConflictDoNothing()
        .returning();

    // lets verify the facility was created
    const facilityObj = firstOrUndefined(facilityEntry);
    if (!facilityObj) {
        throw new Error("Failed to create facility");
    }

    const newAdminVals: User = { ...newAdmin, facilityId: facilityObj.id };

    const userEntry = await db
        .insert(users)
        .values(newAdminVals)
        .onConflictDoNothing()
        .returning();

    // verify the user was created
    const userObj = firstOrUndefined(userEntry);
    if (!userObj) {
        throw new Error("Failed to create user");
    }

    return { facility: facilityObj, user: userObj };
}