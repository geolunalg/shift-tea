import { describe, it, expect, vi, beforeEach } from "vitest";
import { LogResponses } from "@/api/middleware/logger";
import type { Request, Response, NextFunction } from "express";
import { EventEmitter } from "events";

describe("LogResponses middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response> & EventEmitter;
  let next: NextFunction;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    req = { method: "GET", originalUrl: "/test" };
    res = new EventEmitter() as Partial<Response> & EventEmitter;
    res.statusCode = 200;
    next = vi.fn();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls next()", () => {
    LogResponses(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("does not log for statusCode 200", () => {
    LogResponses(req as Request, res as Response, next);

    res.emit("finish");

    expect(logSpy).not.toHaveBeenCalled();
  });

  it("logs for statusCode 500", () => {
    res.statusCode = 500;

    LogResponses(req as Request, res as Response, next);

    res.emit("finish");

    expect(logSpy).toHaveBeenCalledWith(`[NON-OK] GET /test - Status: 500`);
  });

  it("logs for statusCode 199 (below 200)", () => {
    res.statusCode = 199;

    LogResponses(req as Request, res as Response, next);

    res.emit("finish");

    expect(logSpy).toHaveBeenCalledWith(`[NON-OK] GET /test - Status: 199`);
  });
});
