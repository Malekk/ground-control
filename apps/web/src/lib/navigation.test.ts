import { describe, expect, it } from "vitest";
import { isActiveItem, navigationItems } from "./navigation";

describe("navigationItems", () => {
  it("lists the projects and chat pages", () => {
    expect(navigationItems.map((item) => item.href)).toEqual(["/projects", "/chat"]);
  });
});

describe("isActiveItem", () => {
  const projects = { href: "/projects", label: "Projets" };

  it("matches the exact path and its sub-pages", () => {
    expect(isActiveItem(projects, "/projects")).toBe(true);
    expect(isActiveItem(projects, "/projects/42")).toBe(true);
  });

  it("does not match a path that only shares a prefix", () => {
    expect(isActiveItem(projects, "/projects-archive")).toBe(false);
    expect(isActiveItem(projects, "/chat")).toBe(false);
  });
});
