import { describe, expect, it } from "vitest";
import { packageName } from "./index.js";

describe("web", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("web");
  });
});
