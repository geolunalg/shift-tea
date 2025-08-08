import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerFacility } from "@/api/handler/facilities";
import { respondWithJSON } from "@/api/json";
import { hashPassword } from "@/api/middleware/tokens";
import { createFacility } from "@/db/facilities";
import { omitParams } from "@/utils";

// Mock dependencies
vi.mock("@/api/json", () => ({
  respondWithJSON: vi.fn(),
}));

vi.mock("@/api/middleware/tokens", () => ({
  hashPassword: vi.fn(),
}));

vi.mock("@/db/facilities", () => ({
  createFacility: vi.fn(),
}));

vi.mock("@/utils", () => ({
  omitParams: vi.fn(),
}));

describe("registerFacility", () => {
  const baseReq = () => ({
    body: {
      facility: { facilityName: "Test Facility" },
      user: { username: "admin", password: "plainpass" },
    },
  });

  const res: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("hashes password, creates facility, strips fields, and responds", async () => {
    (hashPassword as vi.Mock).mockResolvedValue("hashedpass");
    (createFacility as vi.Mock).mockResolvedValue({
      facility: { id: 1, facilityName: "Test Facility", deleteAt: null },
      user: {
        id: 2,
        username: "admin",
        password: "hashedpass",
        deleteAt: null,
      },
    });

    (omitParams as vi.Mock)
      .mockImplementationOnce((obj) => ({
        id: obj.id,
        facilityName: obj.facilityName,
      }))
      .mockImplementationOnce((obj) => ({
        id: obj.id,
        username: obj.username,
      }));

    await registerFacility(baseReq(), res);

    expect(hashPassword).toHaveBeenCalledWith("plainpass");
    expect(createFacility).toHaveBeenCalledWith(
      { facilityName: "Test Facility" },
      { username: "admin", password: "hashedpass" },
    );
    expect(omitParams).toHaveBeenNthCalledWith(
      1,
      { id: 1, facilityName: "Test Facility", deleteAt: null },
      ["deleteAt"],
    );
    expect(omitParams).toHaveBeenNthCalledWith(
      2,
      { id: 2, username: "admin", password: "hashedpass", deleteAt: null },
      ["deleteAt", "password"],
    );
    expect(respondWithJSON).toHaveBeenCalledWith(res, 200, {
      facility: { id: 1, facilityName: "Test Facility" },
      user: { id: 2, username: "admin" },
    });
  });

  it("throws if password hashing fails", async () => {
    (hashPassword as vi.Mock).mockRejectedValue(new Error("Hash failed"));

    await expect(registerFacility(baseReq(), res)).rejects.toThrow(
      "Hash failed",
    );

    expect(createFacility).not.toHaveBeenCalled();
    expect(respondWithJSON).not.toHaveBeenCalled();
  });

  it("throws if facility creation fails", async () => {
    (hashPassword as vi.Mock).mockResolvedValue("hashedpass");
    (createFacility as vi.Mock).mockRejectedValue(new Error("DB error"));

    await expect(registerFacility(baseReq(), res)).rejects.toThrow("DB error");

    expect(omitParams).not.toHaveBeenCalled();
    expect(respondWithJSON).not.toHaveBeenCalled();
  });

  it("throws if omitParams fails for facility", async () => {
    (hashPassword as vi.Mock).mockResolvedValue("hashedpass");
    (createFacility as vi.Mock).mockResolvedValue({
      facility: { id: 1, facilityName: "Test Facility", deleteAt: null },
      user: {
        id: 2,
        username: "admin",
        password: "hashedpass",
        deleteAt: null,
      },
    });
    (omitParams as vi.Mock).mockImplementationOnce(() => {
      throw new Error("Omit failed");
    });

    await expect(registerFacility(baseReq(), res)).rejects.toThrow(
      "Omit failed",
    );

    expect(respondWithJSON).not.toHaveBeenCalled();
  });

  it("throws if omitParams fails for user", async () => {
    (hashPassword as vi.Mock).mockResolvedValue("hashedpass");
    (createFacility as vi.Mock).mockResolvedValue({
      facility: { id: 1, facilityName: "Test Facility", deleteAt: null },
      user: {
        id: 2,
        username: "admin",
        password: "hashedpass",
        deleteAt: null,
      },
    });
    (omitParams as vi.Mock)
      .mockImplementationOnce((obj) => ({
        id: obj.id,
        facilityName: obj.facilityName,
      }))
      .mockImplementationOnce(() => {
        throw new Error("Omit failed for user");
      });

    await expect(registerFacility(baseReq(), res)).rejects.toThrow(
      "Omit failed for user",
    );

    expect(respondWithJSON).not.toHaveBeenCalled();
  });
});
