import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  errorHandler,
  BadRequestError,
  UserNotAuthenticatedError,
  UserForbiddenError,
  NotFoundError,
} from "@/api/errors";

function createMockResponse() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe("errorHandler", () => {
  let req: any;
  let res: ReturnType<typeof createMockResponse>;
  let next: any;

  beforeEach(() => {
    req = {}; // not used in handler, but required
    res = createMockResponse();
    next = vi.fn();
  });

  it("handles BadRequestError with 400", async () => {
    const err = new BadRequestError("Invalid input");
    await errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid input" });
    expect(next).toHaveBeenCalled();
  });

  it("handles UserNotAuthenticatedError with 401", async () => {
    const err = new UserNotAuthenticatedError("Not logged in");
    await errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Not logged in" });
    expect(next).toHaveBeenCalled();
  });

  it("handles UserForbiddenError with 403", async () => {
    const err = new UserForbiddenError("Access denied");
    await errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Access denied" });
    expect(next).toHaveBeenCalled();
  });

  it("handles NotFoundError with 404", async () => {
    const err = new NotFoundError("Resource not found");
    await errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Resource not found" });
    expect(next).toHaveBeenCalled();
  });

  it("handles unknown error with 500", async () => {
    const err = new Error("Unknown failure");
    await errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Something went wrong on our end: Unknown failure",
    });
    expect(next).toHaveBeenCalled();
  });
});
