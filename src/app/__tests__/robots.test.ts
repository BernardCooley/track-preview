import { describe, it, expect } from "vitest";
import robots from "../robots";

describe("robots", () => {
    const config = robots();
    const rules = config.rules as { userAgent: string; allow: string[]; disallow: string[] };

    it("applies rules to all user agents", () => {
        expect(rules.userAgent).toBe("*");
    });

    it("allows public pages", () => {
        expect(rules.allow).toContain("/");
        expect(rules.allow).toContain("/how-it-works");
        expect(rules.allow).toContain("/legal");
    });

    it("disallows API routes", () => {
        expect(rules.disallow).toContain("/api/");
    });

    it("disallows authenticated app routes", () => {
        expect(rules.disallow).toContain("/explore");
        expect(rules.disallow).toContain("/account");
        expect(rules.disallow).toContain("/settings");
    });

    it("points to the sitemap", () => {
        expect(config.sitemap).toBe("https://www.phoniquest.com/sitemap.xml");
    });
});
