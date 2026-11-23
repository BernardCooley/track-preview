import { describe, it, expect } from "vitest";
import sitemap from "../sitemap";

describe("sitemap", () => {
    const entries = sitemap();

    it("includes the homepage with priority 1", () => {
        const home = entries.find((e) => e.url === "https://www.phoniquest.com");
        expect(home).toBeDefined();
        expect(home!.priority).toBe(1);
    });

    it("includes the how-it-works page", () => {
        const page = entries.find((e) => e.url.endsWith("/how-it-works"));
        expect(page).toBeDefined();
        expect(page!.priority).toBe(0.7);
    });

    it("includes the legal page with low priority", () => {
        const page = entries.find((e) => e.url.endsWith("/legal"));
        expect(page).toBeDefined();
        expect(page!.priority).toBe(0.3);
    });

    it("does not include authenticated routes", () => {
        const urls = entries.map((e) => e.url);
        expect(urls.some((u) => u.includes("/explore"))).toBe(false);
        expect(urls.some((u) => u.includes("/account"))).toBe(false);
        expect(urls.some((u) => u.includes("/settings"))).toBe(false);
        expect(urls.some((u) => u.includes("/loginRegister"))).toBe(false);
    });

    it("sets lastModified on every entry", () => {
        for (const entry of entries) {
            expect(entry.lastModified).toBeInstanceOf(Date);
        }
    });
});
