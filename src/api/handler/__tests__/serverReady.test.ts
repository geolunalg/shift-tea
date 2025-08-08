import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkServerReadiness, apiVersion1 } from "@/api/handler/serverReady"; // adjust path
import { respondWithJSON } from "@/api/json.js";

vi.mock("@/api/json.js", () => ({
  respondWithJSON: vi.fn(),
}));

describe("API Health Endpoints", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {} as any;
    mockRes = {} as any;
    vi.clearAllMocks();
  });

  describe("checkServerReadiness", () => {
    it("calls respondWithJSON with status ok", () => {
      checkServerReadiness(mockReq, mockRes);

      expect(respondWithJSON).toHaveBeenCalledTimes(1);
      expect(respondWithJSON).toHaveBeenCalledWith(mockRes, 200, {
        status: "ok",
      });
    });

    it("does not return a value", () => {
      const result = checkServerReadiness(mockReq, mockRes);
      expect(result).toBeUndefined();
    });

    it("fails if arguments are wrong", () => {
      checkServerReadiness(mockReq, mockRes);
      const callArgs = vi.mocked(respondWithJSON).mock.calls[0];

      expect(callArgs[0]).toBe(mockRes); // first arg: response
      expect(callArgs[1]).toBe(200); // second arg: status code
      expect(callArgs[2]).toEqual({ status: "ok" }); // third arg: payload
      expect(callArgs[2]).not.toEqual({ status: "not-ok" });
    });

    it("does not call respondWithJSON more than once", () => {
      checkServerReadiness(mockReq, mockRes);
      expect(respondWithJSON).toHaveBeenCalledTimes(1);
    });
  });

  describe("apiVersion1", () => {
    it("calls respondWithJSON with correct version info", () => {
      apiVersion1(mockReq, mockRes);

      expect(respondWithJSON).toHaveBeenCalledTimes(1);
      expect(respondWithJSON).toHaveBeenCalledWith(mockRes, 200, {
        message: "Welcome to the API",
        version: "1.0.0",
        status: "OK",
        api: {
          version1: {
            specs: "http://localhost:8080/api/v1/docs",
            rawSpects: "http://localhost:8080/api/v1/docs.json",
          },
        },
      });
    });

    it("does not return a value", () => {
      const result = apiVersion1(mockReq, mockRes);
      expect(result).toBeUndefined();
    });

    it("fails if payload is altered", () => {
      apiVersion1(mockReq, mockRes);
      const payload = vi.mocked(respondWithJSON).mock.calls[0][2];

      expect(payload).toMatchObject({
        message: "Welcome to the API",
        version: "1.0.0",
        status: "OK",
      });

      expect(payload).not.toHaveProperty("error");
      expect(payload.version).not.toBe("2.0.0");
    });

    it("does not call respondWithJSON more than once", () => {
      apiVersion1(mockReq, mockRes);
      expect(respondWithJSON).toHaveBeenCalledTimes(1);
    });
  });
});
