import { describe, expect, it } from "vitest";
import { packageName } from "./index.js";

describe("agents", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("agents");
  });
});
