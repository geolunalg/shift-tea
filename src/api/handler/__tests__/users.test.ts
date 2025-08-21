import { describe, it, expect, vi, beforeEach } from "vitest";
import { userLogin, addUser } from "@/api/handler/users";
import { BadRequestError, UserNotAuthenticatedError } from "@/api/errors";
import { getAllUsers } from "@/api/handler/users";

// Mock dependencies
vi.mock("@/api/json", () => ({
  respondWithJSON: vi.fn(),
}));
vi.mock("@/api/middleware/tokens", () => ({
  checkHashedPassword: vi.fn(),
  makeJWT: vi.fn(),
  makeRefreshToken: vi.fn(),
}));
vi.mock("@/db/users", () => ({
  createUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getUsers: vi.fn(),
}));
vi.mock("@/db/refreshTokens", () => ({
  saveRefreshToken: vi.fn(),
}));
vi.mock("@/db/facilities", () => ({
  getFacilityByUserId: vi.fn(),
}));
vi.mock("@/utils", () => ({
  omitParams: vi.fn((obj, keys) => {
    const copy = { ...obj };
    // eslint-disable-next-line security/detect-object-injection
    keys.forEach((k) => delete copy[k]);
    return copy;
  }),
}));
vi.mock("@/config", () => ({
  config: {
    jwt: {
      tokenDuration: "10m",
      secret: "test-secret",
    },
  },
}));

import { getUsers as mockedGetUsers } from "@/db/users"; // use mocked version

import { respondWithJSON } from "@/api/json";
import {
  checkHashedPassword,
  makeJWT,
  makeRefreshToken,
} from "@/api/middleware/tokens";
import { createUser, getUserByEmail } from "@/db/users";
import { saveRefreshToken } from "@/db/refreshTokens";
import { getFacilityByUserId } from "@/db/facilities";

describe("userLogin", () => {
  const mockReq: any = { body: { email: "test@example.com", password: "pw" } };
  const mockRes: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should login successfully", async () => {
    const mockUser = {
      id: "u1",
      email: "test@example.com",
      password: "hashed",
      name: "Tester",
    };

    (getUserByEmail as vi.Mock).mockResolvedValue(mockUser);
    (checkHashedPassword as vi.Mock).mockResolvedValue(true);
    (makeJWT as vi.Mock).mockResolvedValue("jwt-token");
    (makeRefreshToken as vi.Mock).mockReturnValue("refresh-token");
    (saveRefreshToken as vi.Mock).mockResolvedValue(true);

    await userLogin(mockReq, mockRes);

    expect(getUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(checkHashedPassword).toHaveBeenCalledWith("pw", "hashed");
    expect(makeJWT).toHaveBeenCalledWith("u1", "10m", "test-secret");
    expect(saveRefreshToken).toHaveBeenCalledWith("u1", "refresh-token");
    expect(respondWithJSON).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.objectContaining({ token: "jwt-token", refresh: "refresh-token" }),
    );
  });

  it("should throw if email not found", async () => {
    (getUserByEmail as vi.Mock).mockResolvedValue(null);

    await expect(userLogin(mockReq, mockRes)).rejects.toBeInstanceOf(
      UserNotAuthenticatedError,
    );
    expect(respondWithJSON).not.toHaveBeenCalled();
  });

  it("should throw if password invalid", async () => {
    (getUserByEmail as vi.Mock).mockResolvedValue({
      id: "u1",
      password: "hashed",
    });
    (checkHashedPassword as vi.Mock).mockResolvedValue(false);

    await expect(userLogin(mockReq, mockRes)).rejects.toBeInstanceOf(
      UserNotAuthenticatedError,
    );
  });

  it("should throw if saving refresh token fails", async () => {
    (getUserByEmail as vi.Mock).mockResolvedValue({
      id: "u1",
      password: "hashed",
    });
    (checkHashedPassword as vi.Mock).mockResolvedValue(true);
    (makeJWT as vi.Mock).mockResolvedValue("jwt-token");
    (makeRefreshToken as vi.Mock).mockReturnValue("refresh-token");
    (saveRefreshToken as vi.Mock).mockResolvedValue(false);

    await expect(userLogin(mockReq, mockRes)).rejects.toBeInstanceOf(
      UserNotAuthenticatedError,
    );
  });
});

describe("addUser", () => {
  const mockReq: any = {
    user: { id: "admin1" },
    body: { firstName: "A", lastName: "B", email: "e" },
  };
  const mockRes: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new user successfully", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue({
      facility: { id: "fac1" },
    });
    (createUser as vi.Mock).mockResolvedValue({
      id: "u2",
      firstName: "A",
      lastName: "B",
      email: "e",
      password: "temp",
      facilityId: "fac1",
    });

    await addUser(mockReq, mockRes);

    expect(getFacilityByUserId).toHaveBeenCalledWith("admin1");
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ facilityId: "fac1" }),
    );
    expect(respondWithJSON).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.not.objectContaining({ password: expect.any(String) }),
    );
  });

  it("should throw if facility not found", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue(null);

    await expect(addUser(mockReq, mockRes)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("should throw if facility ID is not a string", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue({
      facility: { id: 123 },
    });

    await expect(addUser(mockReq, mockRes)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("should throw if user creation fails", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue({
      facility: { id: "fac1" },
    });
    (createUser as vi.Mock).mockResolvedValue(null);

    await expect(addUser(mockReq, mockRes)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});

describe("getAllUsers", () => {
  const mockReq: any = { user: { id: "user123" } };
  const mockRes: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return users when facility and users exist", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue({
      facility: { id: "facility123" },
    });
    (mockedGetUsers as vi.Mock).mockResolvedValue([{ id: "u1" }, { id: "u2" }]);

    await getAllUsers(mockReq, mockRes);

    expect(getFacilityByUserId).toHaveBeenCalledWith("user123");
    expect(mockedGetUsers).toHaveBeenCalledWith("facility123");
    expect(respondWithJSON).toHaveBeenCalledWith(
      mockRes,
      200,
      expect.arrayContaining([{ id: "u1" }, { id: "u2" }]),
    );
  });

  it("should throw BadRequestError if facility is not found", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue(null);

    await expect(getAllUsers(mockReq, mockRes)).rejects.toBeInstanceOf(
      BadRequestError,
    );
    expect(respondWithJSON).not.toHaveBeenCalled();
  });

  it("should throw BadRequestError if facility id is not a string", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue({
      facility: { id: 123 },
    });

    await expect(getAllUsers(mockReq, mockRes)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });

  it("should throw BadRequestError if no users are found", async () => {
    (getFacilityByUserId as vi.Mock).mockResolvedValue({
      facility: { id: "facility123" },
    });
    (mockedGetUsers as vi.Mock).mockResolvedValue(null);

    await expect(getAllUsers(mockReq, mockRes)).rejects.toBeInstanceOf(
      BadRequestError,
    );
  });
});
