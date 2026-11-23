import { describe, it, expect } from "vitest";
import manifest from "../manifest";

describe("manifest", () => {
    const m = manifest();

    it("has the correct app name", () => {
        expect(m.name).toBe("Phoniquest");
        expect(m.short_name).toBe("Phoniquest");
    });

    it("sets standalone display mode", () => {
        expect(m.display).toBe("standalone");
    });

    it("starts at the root URL", () => {
        expect(m.start_url).toBe("/");
    });

    it("includes a description", () => {
        expect(m.description).toBeTruthy();
        expect(m.description!.length).toBeGreaterThan(20);
    });

    it("includes at least one icon", () => {
        expect(m.icons).toBeDefined();
        expect(m.icons!.length).toBeGreaterThan(0);
    });
});
