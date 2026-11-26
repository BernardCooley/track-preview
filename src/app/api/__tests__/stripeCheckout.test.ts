import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockCustomersCreate = vi.fn();
const mockCheckoutSessionsCreate = vi.fn();
const mockPortalSessionsCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            findFirst: (...args: any[]) => mockFindFirst(...args),
            update: (...args: any[]) => mockUpdate(...args),
        },
    },
}));

vi.mock("@/lib/stripe", () => ({
    default: () => ({
        customers: {
            create: (...args: any[]) => mockCustomersCreate(...args),
        },
        checkout: {
            sessions: {
                create: (...args: any[]) => mockCheckoutSessionsCreate(...args),
            },
        },
        billingPortal: {
            sessions: {
                create: (...args: any[]) => mockPortalSessionsCreate(...args),
            },
        },
    }),
}));

vi.mock("@/lib/auth", () => ({
    verifyAuth: vi.fn().mockResolvedValue({ uid: "fb-1" }),
    isAuthError: vi.fn().mockReturnValue(false),
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
        },
        body: JSON.stringify(body),
    });
}

function makePortalRequest(body: object) {
    return new Request("http://localhost/api/stripe/create-portal-session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
        },
        body: JSON.stringify(body),
    });
}

describe("create-checkout-session", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 404 when user not found", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue(null);
        const { POST } = await import(
            "../stripe/create-checkout-session/route"
        );
        const res = await POST(makeRequest({ userId: "nonexistent" }));
        expect(res.status).toBe(404);
    });

    it("creates a new Stripe customer when user has none", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            id: "user-1",
            firebaseId: "fb-1",
            stripeCustomerId: null,
        });
        mockCustomersCreate.mockResolvedValue({ id: "cus_new" });
        mockUpdate.mockResolvedValue({});
        mockCheckoutSessionsCreate.mockResolvedValue({
            url: "https://checkout.stripe.com/test",
        });

        const { POST } = await import(
            "../stripe/create-checkout-session/route"
        );
        const res = await POST(makeRequest({ userId: "fb-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.url).toBe("https://checkout.stripe.com/test");
        expect(mockCustomersCreate).toHaveBeenCalledWith({
            metadata: { firebaseId: "fb-1" },
        });
        expect(mockUpdate).toHaveBeenCalledWith({
            where: { id: "user-1" },
            data: { stripeCustomerId: "cus_new" },
        });
    });

    it("reuses existing Stripe customer", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            id: "user-1",
            firebaseId: "fb-1",
            stripeCustomerId: "cus_existing",
        });
        mockCheckoutSessionsCreate.mockResolvedValue({
            url: "https://checkout.stripe.com/test",
        });

        const { POST } = await import(
            "../stripe/create-checkout-session/route"
        );
        const res = await POST(makeRequest({ userId: "fb-1" }));

        expect(res.status).toBe(200);
        expect(mockCustomersCreate).not.toHaveBeenCalled();
        expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
            expect.objectContaining({ customer: "cus_existing" })
        );
    });
});

describe("create-portal-session", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 404 when user has no Stripe customer", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            id: "user-1",
            stripeCustomerId: null,
        });
        const { POST } = await import(
            "../stripe/create-portal-session/route"
        );
        const res = await POST(makePortalRequest({ userId: "fb-1" }));
        expect(res.status).toBe(404);
    });

    it("returns portal URL for user with Stripe customer", async () => {
        vi.resetModules();
        mockFindFirst.mockResolvedValue({
            id: "user-1",
            stripeCustomerId: "cus_123",
        });
        mockPortalSessionsCreate.mockResolvedValue({
            url: "https://billing.stripe.com/test",
        });

        const { POST } = await import(
            "../stripe/create-portal-session/route"
        );
        const res = await POST(makePortalRequest({ userId: "fb-1" }));
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.url).toBe("https://billing.stripe.com/test");
    });
});
