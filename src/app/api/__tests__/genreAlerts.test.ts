import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGroupBy = vi.fn();
const mockUserFindMany = vi.fn();
const mockUserDeleteMany = vi.fn();
const mockReviewDeleteMany = vi.fn();
const mockSendGenreAlertEmail = vi.fn();
const mockNotifyDiscord = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        track: {
            groupBy: (...args: any[]) => mockGroupBy(...args),
        },
        user: {
            findMany: (...args: any[]) => mockUserFindMany(...args),
            deleteMany: (...args: any[]) => mockUserDeleteMany(...args),
        },
        review: {
            deleteMany: (...args: any[]) => mockReviewDeleteMany(...args),
        },
    },
}));

vi.mock("@/lib/email", () => ({
    sendGenreAlertEmail: (...args: any[]) => mockSendGenreAlertEmail(...args),
}));

vi.mock("@/lib/notifyDiscord", () => ({
    notifyDiscord: (...args: any[]) => mockNotifyDiscord(...args),
}));

function makeRequest() {
    return new Request("http://localhost/api/cron/dailyMaintenance", {
        method: "GET",
        headers: { authorization: `Bearer test-secret` },
    });
}

function mockCleanupEmpty() {
    mockUserFindMany.mockResolvedValueOnce([]);
}

describe("dailyMaintenance — genre alerts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("CRON_SECRET", "test-secret");
    });

    it("returns 401 without valid auth", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        const res = await GET(
            new Request("http://localhost/api/cron/dailyMaintenance", {
                method: "GET",
                headers: { authorization: "Bearer wrong" },
            })
        );

        expect(res.status).toBe(401);
    });

    it("returns no-new-tracks when no recent tracks exist", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        mockCleanupEmpty();
        mockGroupBy.mockResolvedValue([]);

        const res = await GET(makeRequest());
        const json = await res.json();

        expect(json.alerts.emailsSent).toBe(0);
        expect(json.alerts.reason).toBe("no-new-tracks");
    });

    it("returns no-subscribers when nobody matches", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        mockCleanupEmpty();
        mockGroupBy.mockResolvedValue([
            { genre: "Techno", _count: { id: 5 } },
        ]);
        mockUserFindMany.mockResolvedValueOnce([]);

        const res = await GET(makeRequest());
        const json = await res.json();

        expect(json.alerts.emailsSent).toBe(0);
        expect(json.alerts.reason).toBe("no-subscribers");
    });

    it("sends emails to subscribers with matching genres", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        mockCleanupEmpty();
        mockGroupBy.mockResolvedValue([
            { genre: "Techno", _count: { id: 10 } },
            { genre: "House", _count: { id: 3 } },
        ]);
        mockUserFindMany.mockResolvedValueOnce([
            { email: "user1@test.com", genreAlerts: ["Techno"] },
            { email: "user2@test.com", genreAlerts: ["Techno", "House"] },
        ]);
        mockSendGenreAlertEmail.mockResolvedValue(undefined);

        const res = await GET(makeRequest());
        const json = await res.json();

        expect(json.alerts.emailsSent).toBe(2);
        expect(mockSendGenreAlertEmail).toHaveBeenCalledTimes(2);

        expect(mockSendGenreAlertEmail).toHaveBeenCalledWith("user1@test.com", [
            { genre: "Techno", count: 10 },
        ]);
        expect(mockSendGenreAlertEmail).toHaveBeenCalledWith("user2@test.com", [
            { genre: "Techno", count: 10 },
            { genre: "House", count: 3 },
        ]);
    });

    it("only includes genres the user is subscribed to", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        mockCleanupEmpty();
        mockGroupBy.mockResolvedValue([
            { genre: "Techno", _count: { id: 5 } },
            { genre: "House", _count: { id: 3 } },
            { genre: "Jazz", _count: { id: 2 } },
        ]);
        mockUserFindMany.mockResolvedValueOnce([
            { email: "user@test.com", genreAlerts: ["Jazz"] },
        ]);
        mockSendGenreAlertEmail.mockResolvedValue(undefined);

        await GET(makeRequest());

        expect(mockSendGenreAlertEmail).toHaveBeenCalledWith("user@test.com", [
            { genre: "Jazz", count: 2 },
        ]);
    });

    it("handles email send failures gracefully", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        mockCleanupEmpty();
        mockGroupBy.mockResolvedValue([
            { genre: "Techno", _count: { id: 5 } },
        ]);
        mockUserFindMany.mockResolvedValueOnce([
            { email: "good@test.com", genreAlerts: ["Techno"] },
            { email: "bad@test.com", genreAlerts: ["Techno"] },
        ]);
        mockSendGenreAlertEmail
            .mockResolvedValueOnce(undefined)
            .mockRejectedValueOnce(new Error("SMTP error"));

        const res = await GET(makeRequest());
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.alerts.emailsSent).toBe(1);
        expect(json.alerts.errors).toBe(1);
    });

    it("queries DAILY subscribers with genreAlertFrequency filter", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        mockCleanupEmpty();
        mockGroupBy.mockResolvedValue([
            { genre: "Techno", _count: { id: 5 } },
        ]);
        mockUserFindMany.mockResolvedValueOnce([]);

        await GET(makeRequest());

        expect(mockUserFindMany).toHaveBeenCalledWith({
            where: {
                email: { not: null },
                genreAlerts: { hasSome: ["Techno"] },
                genreAlertFrequency: "DAILY",
                isAnonymous: false,
                subscriptionTier: "PRO",
            },
            select: {
                email: true,
                genreAlerts: true,
            },
        });
    });

    it("runs cleanup and reports results alongside alerts", async () => {
        const { GET } = await import("../cron/dailyMaintenance/route");

        mockUserFindMany.mockResolvedValueOnce([{ id: "anon-1" }]);
        mockReviewDeleteMany.mockResolvedValue({ count: 3 });
        mockUserDeleteMany.mockResolvedValue({ count: 1 });
        mockGroupBy.mockResolvedValue([]);

        const res = await GET(makeRequest());
        const json = await res.json();

        expect(json.cleanup.deleted).toBe(1);
        expect(json.cleanup.reviewsDeleted).toBe(3);
        expect(json.alerts.emailsSent).toBe(0);
    });
});

describe("getActiveFrequencies", () => {
    it("returns only DAILY on a normal weekday", async () => {
        const { getActiveFrequencies } = await import("../cron/dailyMaintenance/route");
        // Wednesday 2026-11-25
        const wed = new Date("2026-11-25T05:00:00Z");
        expect(getActiveFrequencies(wed)).toEqual(["DAILY"]);
    });

    it("returns DAILY and WEEKLY on Monday", async () => {
        const { getActiveFrequencies } = await import("../cron/dailyMaintenance/route");
        // Monday 2026-11-30
        const mon = new Date("2026-11-30T05:00:00Z");
        expect(getActiveFrequencies(mon)).toEqual(["DAILY", "WEEKLY"]);
    });

    it("returns DAILY and MONTHLY on the 1st", async () => {
        const { getActiveFrequencies } = await import("../cron/dailyMaintenance/route");
        // Tuesday 2026-12-01
        const first = new Date("2026-12-01T05:00:00Z");
        expect(getActiveFrequencies(first)).toEqual(["DAILY", "MONTHLY"]);
    });

    it("returns all three when the 1st is a Monday", async () => {
        const { getActiveFrequencies } = await import("../cron/dailyMaintenance/route");
        // Monday 2026-06-01
        const monFirst = new Date("2026-06-01T05:00:00Z");
        expect(getActiveFrequencies(monFirst)).toEqual(["DAILY", "WEEKLY", "MONTHLY"]);
    });
});
