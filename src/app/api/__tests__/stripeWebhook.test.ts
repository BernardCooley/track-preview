import { describe, it, expect, vi, beforeEach } from "vitest";

const mockUpdateMany = vi.fn();
const mockUserFindFirst = vi.fn();
const mockUserUpdate = vi.fn();
const mockReviewUpdateMany = vi.fn();
const mockConstructEvent = vi.fn();
const mockSubscriptionsRetrieve = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        user: {
            updateMany: (...args: any[]) => mockUpdateMany(...args),
            findFirst: (...args: any[]) => mockUserFindFirst(...args),
            update: (...args: any[]) => mockUserUpdate(...args),
        },
        review: {
            updateMany: (...args: any[]) => mockReviewUpdateMany(...args),
        },
    },
}));

vi.mock("@/lib/stripe", () => ({
    default: () => ({
        webhooks: {
            constructEvent: (...args: any[]) => mockConstructEvent(...args),
        },
        subscriptions: {
            retrieve: (...args: any[]) => mockSubscriptionsRetrieve(...args),
        },
    }),
}));

function makeRequest(body: string, signature: string | null = "sig_test") {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (signature) headers.set("stripe-signature", signature);
    return new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers,
        body,
    });
}

describe("stripe webhook", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUserFindFirst.mockResolvedValue(null);
    });

    it("returns 400 when stripe-signature header is missing", async () => {
        vi.resetModules();
        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}", null));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("Missing stripe-signature header");
    });

    it("returns 400 when signature verification fails", async () => {
        vi.resetModules();
        mockConstructEvent.mockImplementation(() => {
            throw new Error("Invalid signature");
        });
        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("Invalid signature");
    });

    it("handles checkout.session.completed and updates user to PRO", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "checkout.session.completed",
            data: {
                object: {
                    subscription: "sub_123",
                    customer: "cus_123",
                    metadata: { firebaseId: "fb_123" },
                },
            },
        });
        mockSubscriptionsRetrieve.mockResolvedValue({
            metadata: { firebaseId: "fb_123" },
            items: { data: [{ current_period_end: 1700000000 }] },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { firebaseId: "fb_123" },
            data: expect.objectContaining({
                subscriptionTier: "PRO",
                subscriptionStatus: "ACTIVE",
                stripeCustomerId: "cus_123",
                stripeSubscriptionId: "sub_123",
            }),
        });
    });

    it("handles customer.subscription.updated with active status", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.updated",
            data: {
                object: {
                    status: "active",
                    metadata: { firebaseId: "fb_123" },
                    items: { data: [{ current_period_end: 1700000000 }] },
                },
            },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { firebaseId: "fb_123" },
            data: expect.objectContaining({
                subscriptionStatus: "ACTIVE",
                subscriptionTier: "PRO",
            }),
        });
    });

    it("handles customer.subscription.updated with canceled status and keeps PRO until period end", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.updated",
            data: {
                object: {
                    status: "canceled",
                    metadata: { firebaseId: "fb_123" },
                    items: { data: [{ current_period_end: 1700000000 }] },
                },
            },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { firebaseId: "fb_123" },
            data: expect.objectContaining({
                subscriptionStatus: "CANCELED",
                subscriptionTier: "PRO",
            }),
        });
    });

    it("handles customer.subscription.updated with past_due status", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.updated",
            data: {
                object: {
                    status: "past_due",
                    metadata: { firebaseId: "fb_123" },
                    items: { data: [{ current_period_end: 1700000000 }] },
                },
            },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { firebaseId: "fb_123" },
            data: expect.objectContaining({
                subscriptionStatus: "PAST_DUE",
                subscriptionTier: "PRO",
            }),
        });
    });

    it("handles customer.subscription.deleted and resets to FREE", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.deleted",
            data: {
                object: {
                    metadata: { firebaseId: "fb_123" },
                },
            },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { firebaseId: "fb_123" },
            data: {
                subscriptionTier: "FREE",
                subscriptionStatus: "CANCELED",
                stripeSubscriptionId: null,
            },
        });
    });

    it("disables curated mode when subscription goes past_due", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.updated",
            data: {
                object: {
                    status: "past_due",
                    metadata: { firebaseId: "fb_123" },
                    items: { data: [{ current_period_end: 1700000000 }] },
                },
            },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });
        mockUserFindFirst.mockResolvedValue({ id: "user_1", curatedMode: true });
        mockUserUpdate.mockResolvedValue({ count: 1 });
        mockReviewUpdateMany.mockResolvedValue({ count: 2 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUserFindFirst).toHaveBeenCalledWith({
            where: { firebaseId: "fb_123" },
            select: { id: true, curatedMode: true },
        });
        expect(mockUserUpdate).toHaveBeenCalledWith({
            where: { id: "user_1" },
            data: { curatedMode: false },
        });
        expect(mockReviewUpdateMany).toHaveBeenCalledWith({
            where: { userId: "user_1", currentReviewStep: { in: [2, 3] } },
            data: { currentReviewStep: 4, furthestReviewStep: 4 },
        });
    });

    it("disables curated mode when subscription is deleted", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.deleted",
            data: {
                object: {
                    metadata: { firebaseId: "fb_123" },
                },
            },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });
        mockUserFindFirst.mockResolvedValue({ id: "user_1", curatedMode: true });
        mockUserUpdate.mockResolvedValue({ count: 1 });
        mockReviewUpdateMany.mockResolvedValue({ count: 2 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUserUpdate).toHaveBeenCalledWith({
            where: { id: "user_1" },
            data: { curatedMode: false },
        });
        expect(mockReviewUpdateMany).toHaveBeenCalledWith({
            where: { userId: "user_1", currentReviewStep: { in: [2, 3] } },
            data: { currentReviewStep: 4, furthestReviewStep: 4 },
        });
    });

    it("skips curated mode disable when user does not have curated mode on", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "customer.subscription.updated",
            data: {
                object: {
                    status: "canceled",
                    metadata: { firebaseId: "fb_123" },
                    items: { data: [{ current_period_end: 1700000000 }] },
                },
            },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });
        mockUserFindFirst.mockResolvedValue({ id: "user_1", curatedMode: false });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUserUpdate).not.toHaveBeenCalled();
        expect(mockReviewUpdateMany).not.toHaveBeenCalled();
    });

    it("handles invoice.payment_failed and sets PAST_DUE", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "invoice.payment_failed",
            data: {
                object: {
                    parent: {
                        subscription_details: {
                            subscription: "sub_123",
                        },
                    },
                },
            },
        });
        mockSubscriptionsRetrieve.mockResolvedValue({
            metadata: { firebaseId: "fb_123" },
        });
        mockUpdateMany.mockResolvedValue({ count: 1 });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);

        expect(mockUpdateMany).toHaveBeenCalledWith({
            where: { firebaseId: "fb_123" },
            data: { subscriptionStatus: "PAST_DUE" },
        });
    });

    it("skips invoice.payment_failed when no subscription on invoice", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "invoice.payment_failed",
            data: {
                object: {
                    parent: null,
                },
            },
        });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);
        expect(mockUpdateMany).not.toHaveBeenCalled();
    });

    it("skips checkout.session.completed when firebaseId is missing from metadata", async () => {
        vi.resetModules();
        mockConstructEvent.mockReturnValue({
            type: "checkout.session.completed",
            data: {
                object: {
                    subscription: "sub_123",
                    customer: "cus_123",
                    metadata: {},
                },
            },
        });
        mockSubscriptionsRetrieve.mockResolvedValue({
            metadata: {},
            items: { data: [{ current_period_end: 1700000000 }] },
        });

        const { POST } = await import("../stripe/webhook/route");
        const res = await POST(makeRequest("{}"));
        expect(res.status).toBe(200);
        expect(mockUpdateMany).not.toHaveBeenCalled();
    });
});
