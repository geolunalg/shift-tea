import { Router } from "express";
import { LogResponses } from "@/api/middleware";
import { checkServerReadiness, userLogin, registerFacility } from "@/api/handler";


const v1Routes = Router();

v1Routes.use(LogResponses)

// public
v1Routes.get("/healthz", checkServerReadiness);
v1Routes.post("/facilities", registerFacility);
v1Routes.post("/login", userLogin);



export default v1Routes;