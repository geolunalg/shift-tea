import { Router } from "express";
import { LogResponses } from "@/api/middleware/logger";
import { apiVersion1, checkServerReadiness } from "@/api/handler/serverReady";
import { registerFacility } from "@/api/handler/facilities";
import { addUser, userLogin } from "@/api/handler/users";
import { authenticate } from "@/api/middleware/auth";
import { refreshToken, revokeToken } from "@/api/handler/tokens";
import { generateShifts, getMonthShifts } from "@/api/handler/shifts";

const v1Routes = Router();
v1Routes.use(LogResponses);

// root api response
v1Routes.get("/", apiVersion1);

// public
v1Routes.get("/healthz", checkServerReadiness);
v1Routes.post("/facilities", registerFacility);
v1Routes.post("/login", userLogin);

// private
v1Routes.post("/users", authenticate, addUser);

v1Routes.post("/refresh", refreshToken);
v1Routes.post("/revoke", revokeToken);
v1Routes.post("/shifts", authenticate, generateShifts);

v1Routes.get("/shifts", authenticate, getMonthShifts);

export default v1Routes;
