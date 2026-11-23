import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findFirst: (...args: any[]) => mockFindFirst(...args),
        },
    },
}));

describe("requireProSubscription", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubEnv("NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS", "true");
    });

    it("returns 404 when user not found", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue(null);
        const { requireProSubscription } = await import(
            "../requireProSubscription"
        );

        const result = await requireProSubscription("unknown-user");
        expect(result).not.toBeNull();
        expect(result!.status).toBe(404);
    });

    it("returns null (pass) for PRO/ACTIVE user", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            subscriptionTier: "PRO",
            subscriptionStatus: "ACTIVE",
            subscriptionExpiresAt: null,
        });
        const { requireProSubscription } = await import(
            "../requireProSubscription"
        );

        const result = await requireProSubscription("pro-user");
        expect(result).toBeNull();
    });

    it("returns 403 for FREE tier user", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            subscriptionTier: "FREE",
            subscriptionStatus: null,
            subscriptionExpiresAt: null,
        });
        const { requireProSubscription } = await import(
            "../requireProSubscription"
        );

        const result = await requireProSubscription("free-user");
        expect(result).not.toBeNull();
        expect(result!.status).toBe(403);
    });

    it("returns null (pass) for PRO/PAST_DUE within grace period", async () => {
        vi.resetModules();
        const future = new Date();
        future.setDate(future.getDate() + 7);

        mockFindFirst.mockResolvedValue({
            subscriptionTier: "PRO",
            subscriptionStatus: "PAST_DUE",
            subscriptionExpiresAt: future,
        });
        const { requireProSubscription } = await import(
            "../requireProSubscription"
        );

        const result = await requireProSubscription("grace-user");
        expect(result).toBeNull();
    });

    it("returns 403 for PRO/PAST_DUE after grace period expired", async () => {
        vi.resetModules();
        const past = new Date();
        past.setDate(past.getDate() - 1);

        mockFindFirst.mockResolvedValue({
            subscriptionTier: "PRO",
            subscriptionStatus: "PAST_DUE",
            subscriptionExpiresAt: past,
        });
        const { requireProSubscription } = await import(
            "../requireProSubscription"
        );

        const result = await requireProSubscription("expired-user");
        expect(result).not.toBeNull();
        expect(result!.status).toBe(403);
    });

    it("returns 403 for PRO/CANCELED user", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            subscriptionTier: "PRO",
            subscriptionStatus: "CANCELED",
            subscriptionExpiresAt: null,
        });
        const { requireProSubscription } = await import(
            "../requireProSubscription"
        );

        const result = await requireProSubscription("canceled-user");
        expect(result).not.toBeNull();
        expect(result!.status).toBe(403);
    });
});
