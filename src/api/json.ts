import { Response } from "express";


export function respondWithJSON(res: Response, code: number, payload: any) {
    if (typeof payload !== "object" && typeof payload !== "string") {
        throw new Error("Response payload must and object or a string");
    }

    res.header("Content-Type", "application/json");
    const body = JSON.stringify(payload);
    res.status(code).send(body);
    res.end();
}

export function respondWithError(res: Response, code: number, message: string) {
    respondWithJSON(res, code, { error: message });
}