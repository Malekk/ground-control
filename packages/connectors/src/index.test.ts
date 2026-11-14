import { describe, expect, it } from "vitest";
import { packageName } from "./index.js";

describe("connectors", () => {
  it("exposes its package name", () => {
    expect(packageName).toBe("connectors");
  });
});
