import { describe, it, expect, vi, beforeEach } from "vitest";
import { refreshToken, revokeToken } from "@/api/handler/tokens";
import { UserNotAuthenticatedError } from "@/api/errors";

// Mock dependencies
vi.mock("@/api/middleware/tokens", () => ({
  getBearerToken: vi.fn(),
  makeJWT: vi.fn(),
}));
vi.mock("@/api/json", () => ({
  respondWithJSON: vi.fn(),
}));
vi.mock("@/db/refreshTokens", () => ({
  refreshUserToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
}));
vi.mock("@/config", () => ({
  config: {
    jwt: {
      refreshDuration: "15m",
      secret: "test-secret",
    },
  },
}));

import { getBearerToken, makeJWT } from "@/api/middleware/tokens";
import { respondWithJSON } from "@/api/json";
import { refreshUserToken, revokeRefreshToken } from "@/db/refreshTokens";

describe("refreshToken", () => {
  const mockReq: any = {};
  const mockRes: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a new access token when refresh token is valid", async () => {
    (getBearerToken as vi.Mock).mockReturnValue("valid-refresh-token");
    (refreshUserToken as vi.Mock).mockResolvedValue({
      user: { id: "user123" },
    });
    (makeJWT as vi.Mock).mockResolvedValue("new-jwt-token");

    await refreshToken(mockReq, mockRes);

    expect(getBearerToken).toHaveBeenCalledWith(mockReq);
    expect(refreshUserToken).toHaveBeenCalledWith("valid-refresh-token");
    expect(makeJWT).toHaveBeenCalledWith("user123", "15m", "test-secret");
    expect(respondWithJSON).toHaveBeenCalledWith(mockRes, 200, {
      token: "new-jwt-token",
    });
  });

  it("should throw UserNotAuthenticatedError when refresh token is invalid", async () => {
    (getBearerToken as vi.Mock).mockReturnValue("invalid-refresh-token");
    (refreshUserToken as vi.Mock).mockResolvedValue(null);

    await expect(refreshToken(mockReq, mockRes)).rejects.toBeInstanceOf(
      UserNotAuthenticatedError,
    );

    expect(respondWithJSON).not.toHaveBeenCalled();
  });
});

describe("revokeToken", () => {
  const mockReq: any = {};
  const mockRes: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should revoke the refresh token and return 204", async () => {
    (getBearerToken as vi.Mock).mockReturnValue("token-to-revoke");

    await revokeToken(mockReq, mockRes);

    expect(getBearerToken).toHaveBeenCalledWith(mockReq);
    expect(revokeRefreshToken).toHaveBeenCalledWith("token-to-revoke");
    expect(respondWithJSON).toHaveBeenCalledWith(mockRes, 204, { ok: "OK" });
  });
});
