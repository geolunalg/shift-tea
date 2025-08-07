import { describe, it, expect, vi, beforeEach } from "vitest";
import { respondWithJSON, respondWithError } from "@/api/json";

// Create a mock Express Response object
function createMockResponse() {
  return {
    header: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    end: vi.fn(),
  } as unknown as ReturnType<() => import("express").Response>;
}

describe("respondWithJSON", () => {
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    res = createMockResponse();
  });

  it("sets the content type to application/json", () => {
    respondWithJSON(res, 200, { success: true });
    expect(res.header).toHaveBeenCalledWith("Content-Type", "application/json");
  });

  it("sends the JSON payload with the given status", () => {
    const payload = { message: "ok" };
    respondWithJSON(res, 201, payload);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(JSON.stringify(payload));
    expect(res.end).toHaveBeenCalled();
  });

  it("handles string payloads correctly", () => {
    const payload = "hello";
    respondWithJSON(res, 200, payload);
    expect(res.send).toHaveBeenCalledWith(JSON.stringify(payload));
  });

  it("throws an error for invalid payload types", () => {
    expect(() => {
      respondWithJSON(res, 200, 123); // number is not allowed
    }).toThrow("Response payload must and object or a string");
  });
});

describe("respondWithError", () => {
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    res = createMockResponse();
  });

  it("sends an error object with the given message and status", () => {
    respondWithError(res, 400, "Invalid input");
    expect(res.send).toHaveBeenCalledWith(
      JSON.stringify({ error: "Invalid input" }),
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
