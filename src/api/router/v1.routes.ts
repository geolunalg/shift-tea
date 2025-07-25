import { Router } from "express";
import { LogResponses } from "@/api/middleware/logger";
import { checkServerReadiness } from "@/api/handler/serverReady";
import { registerFacility } from "@/api/handler/facilities";
import { addUser, userLogin } from "@/api/handler/users";


const v1Routes = Router();
v1Routes.use(LogResponses)

// public
v1Routes.get("/healthz", checkServerReadiness);
v1Routes.post("/facilities", registerFacility);
v1Routes.post("/login", userLogin);

// private
v1Routes.post("/users", addUser);

export default v1Routes;
