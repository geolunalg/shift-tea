import { describe, it, expect } from "vitest";
import { firstOrUndefined, omitParams } from "@/utils";

describe("firstOrUndefined", () => {
  it("should return the first item when array is not empty", () => {
    const result = firstOrUndefined([1, 2, 3]);
    expect(result).toBe(1);
  });

  it("should return undefined when array is empty", () => {
    const result = firstOrUndefined([]);
    expect(result).toBeUndefined();
  });

  it("should work with array of objects", () => {
    const input = [{ id: 1 }, { id: 2 }];
    const result = firstOrUndefined(input);
    expect(result).toEqual({ id: 1 });
  });
});

describe("omitParams", () => {
  it("should omit the specified keys from the object", () => {
    const input = { a: 1, b: 2, c: 3 };
    const result = omitParams(input, ["a", "c"]);
    expect(result).toEqual({ b: 2 });
  });

  it("should return the same object if no keys are omitted", () => {
    const input = { x: 42 };
    const result = omitParams(input, []);
    expect(result).toEqual({ x: 42 });
  });

  it("should handle non-existent keys gracefully", () => {
    const input = { a: 1, b: 2 };
    const result = omitParams(input, ["c" as keyof typeof input]);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should work with nested objects (shallow)", () => {
    const input = { a: 1, b: { nested: true } };
    const result = omitParams(input, ["b"]);
    expect(result).toEqual({ a: 1 });
  });
});
