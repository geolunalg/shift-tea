import "express";
import { SafeUser } from "@/api/middleware/auth";

declare global {
    namespace Express {
        interface Request {
            user?: SafeUser;
        }
    }
}