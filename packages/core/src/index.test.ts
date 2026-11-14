import { describe, expect, it } from "vitest";
import { packageName } from "./index.js";

describe("core", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("core");
  });
});
