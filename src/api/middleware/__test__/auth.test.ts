import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticate } from "@/api/middleware/auth";
import { getBearerToken, validateJWT } from "@/api/middleware/tokens";
import { config } from "@/config";
import type { Request, Response, NextFunction } from "express";

vi.mock("@/api/middleware/tokens", () => ({
  getBearerToken: vi.fn(),
  validateJWT: vi.fn(),
}));

vi.mock("@/config", () => ({
  config: {
    jwt: { secret: "test-secret" },
  },
}));

describe("authenticate middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {};
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("attaches user id to req and calls next()", async () => {
    (getBearerToken as vi.Mock).mockReturnValue("fake-token");
    (validateJWT as vi.Mock).mockReturnValue("user-123");

    await authenticate(req as Request, res as Response, next);

    expect(getBearerToken).toHaveBeenCalledWith(req);
    expect(validateJWT).toHaveBeenCalledWith("fake-token", config.jwt.secret);
    expect(req.user).toEqual({ id: "user-123" });
    expect(next).toHaveBeenCalled();
  });

  it("still calls next() if token is invalid (validateJWT throws)", async () => {
    (getBearerToken as vi.Mock).mockReturnValue("bad-token");
    (validateJWT as vi.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await expect(
      authenticate(req as Request, res as Response, next),
    ).rejects.toThrow("Invalid token");

    expect(next).not.toHaveBeenCalled();
  });
});
