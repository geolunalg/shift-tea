import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  getBearerToken,
  validateJWT,
  makeJWT,
  makeRefreshToken,
  hashPassword,
  checkHashedPassword,
} from "@/api/middleware/tokens";
import { UserNotAuthenticatedError } from "@/api/errors";
import type { Request } from "express";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

describe("tokens utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("hashPassword", () => {
    it("hashes the password with bcrypt", async () => {
      (bcrypt.hash as unknown as vi.Mock).mockResolvedValue("hashed");
      const result = await hashPassword("mypassword");
      expect(bcrypt.hash).toHaveBeenCalledWith("mypassword", 10);
      expect(result).toBe("hashed");
    });
  });

  describe("checkHashedPassword", () => {
    it("compares password with hash", async () => {
      (bcrypt.compare as unknown as vi.Mock).mockResolvedValue(true);
      const result = await checkHashedPassword("pw", "hash");
      expect(bcrypt.compare).toHaveBeenCalledWith("pw", "hash");
      expect(result).toBe(true);
    });
  });

  describe("makeJWT", () => {
    it("creates a signed JWT with correct payload", async () => {
      const fakeToken = "signed.jwt.token";
      (jwt.sign as unknown as vi.Mock).mockReturnValue(fakeToken);

      const userId = "user-123";
      const secret = "secret";
      const expiresIn = 60;

      const token = await makeJWT(userId, expiresIn, secret);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          iss: "simple-scheduler",
          sub: userId,
          iat: expect.any(Number),
          exp: expect.any(Number),
        }),
        secret,
        { algorithm: "HS256" },
      );
      expect(token).toBe(fakeToken);
    });
  });

  describe("makeRefreshToken", () => {
    it("creates a 64-char hex token", () => {
      const token = makeRefreshToken();
      expect(typeof token).toBe("string");
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("getBearerToken", () => {
    it("extracts token from header", () => {
      const req = {
        get: vi.fn().mockReturnValue("Bearer abc123"),
      } as unknown as Request;

      const token = getBearerToken(req);
      expect(token).toBe("abc123");
    });

    it("throws if no Authorization header", () => {
      const req = {
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as Request;
      expect(() => getBearerToken(req)).toThrow(UserNotAuthenticatedError);
    });

    it("throws if malformed header", () => {
      const req = {
        get: vi.fn().mockReturnValue("Token abc123"),
      } as unknown as Request;
      expect(() => getBearerToken(req)).toThrow(UserNotAuthenticatedError);
    });
  });

  describe("validateJWT", () => {
    const secret = "test-secret";

    it("returns user id if valid", () => {
      (jwt.verify as unknown as vi.Mock).mockReturnValue({
        iss: "simple-scheduler",
        sub: "user-123",
      });

      const sub = validateJWT("good-token", secret);

      expect(jwt.verify).toHaveBeenCalledWith("good-token", secret);
      expect(sub).toBe("user-123");
    });

    it("throws if jwt.verify throws", () => {
      (jwt.verify as unknown as vi.Mock).mockImplementation(() => {
        throw new Error("invalid signature");
      });

      expect(() => validateJWT("bad-token", secret)).toThrow(
        UserNotAuthenticatedError,
      );
    });

    it("throws if issuer is wrong", () => {
      (jwt.verify as unknown as vi.Mock).mockReturnValue({
        iss: "other-app",
        sub: "user-123",
      });

      expect(() => validateJWT("bad-issuer", secret)).toThrow(
        UserNotAuthenticatedError,
      );
    });

    it("throws if no sub", () => {
      (jwt.verify as unknown as vi.Mock).mockReturnValue({
        iss: "simple-scheduler",
      });

      expect(() => validateJWT("no-sub", secret)).toThrow(
        UserNotAuthenticatedError,
      );
    });
  });
});
