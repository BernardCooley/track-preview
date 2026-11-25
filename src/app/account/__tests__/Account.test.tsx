import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import Settings from "../page";
import { DeleteUser, LogOut, UpdateUserEmail, UpdateUserPassword } from "../../../../firebase/utils";
import { sendVerificationEmail, createPortalSession, createCheckoutSession } from "@/bff/bff";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { mockRouter } from "../../../../test/mocks/navigation";
import type { User as FirebaseUser } from "firebase/auth";
import { useSubscription } from "@/hooks/useSubscription";

vi.mock("../../../../firebase/firebaseInit", () => ({
    auth: {
        currentUser: {
            uid: "test-123",
            email: "user@example.com",
            emailVerified: true,
            isAnonymous: false,
            reload: vi.fn(() => Promise.resolve()),
        },
    },
    provider: {},
}));

vi.mock("../../../../firebase/utils", () => ({
    DeleteUser: vi.fn(),
    LogOut: vi.fn(),
    UpdateUserEmail: vi.fn(() => Promise.resolve()),
    UpdateUserPassword: vi.fn(() => Promise.resolve()),
    GetCurrentUser: vi.fn(() => Promise.resolve(null)),
}));

const mockCurrentUser = {
    uid: "test-123",
    email: "user@example.com",
    emailVerified: true,
    isAnonymous: false,
} as FirebaseUser;

vi.mock("@/bff/bff", () => ({
    sendVerificationEmail: vi.fn(() => Promise.resolve()),
    getUserProfile: vi.fn(() => Promise.resolve(null)),
    spotifyDisconnect: vi.fn(() => Promise.resolve({ success: true })),
    createPortalSession: vi.fn(() => Promise.resolve({ url: "https://billing.stripe.com/session/test" })),
    createCheckoutSession: vi.fn(() => Promise.resolve({ url: "https://checkout.stripe.com/session/test" })),
    syncSubscription: vi.fn(() => Promise.resolve({ status: "ACTIVE", tier: "PRO" })),
}));

vi.mock("@/hooks/useSubscription", () => ({
    useSubscription: vi.fn(),
}));

const mockUseSubscription = vi.mocked(useSubscription);

const defaultSubscription = {
    isPro: false,
    isInGracePeriod: false,
    subscriptionsEnabled: false,
    subscriptionTier: "FREE" as const,
    subscriptionStatus: null,
    upgradeFeature: null,
    requirePro: vi.fn(() => false),
    dismissUpgrade: vi.fn(),
};

const enabledSubscription = {
    ...defaultSubscription,
    subscriptionsEnabled: true,
};

const minimalUserProfile = {
    subscriptionTier: "FREE",
    subscriptionStatus: null,
} as any;

vi.mock("firebase/auth", () => ({
    getAuth: vi.fn(() => ({ currentUser: mockCurrentUser })),
    onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: FirebaseUser | null) => void) => {
        callback({
            uid: "test-123",
            email: "user@example.com",
            emailVerified: true,
            isAnonymous: false,
            reload: vi.fn(() => Promise.resolve()),
        } as unknown as FirebaseUser);
        return vi.fn();
    }),
    signOut: vi.fn(() => Promise.resolve()),
    EmailAuthProvider: { credential: vi.fn() },
    sendEmailVerification: vi.fn(() => Promise.resolve()),
    updateEmail: vi.fn(() => Promise.resolve()),
    updatePassword: vi.fn(() => Promise.resolve()),
}));

const mockDeleteUser = vi.mocked(DeleteUser);
const mockLogOut = vi.mocked(LogOut);
const mockUpdateUserEmail = vi.mocked(UpdateUserEmail);
const mockUpdateUserPassword = vi.mocked(UpdateUserPassword);
const mockSendVerificationEmail = vi.mocked(sendVerificationEmail);
const mockGetAuth = vi.mocked(getAuth);

describe("Account Settings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSubscription.mockReturnValue(defaultSubscription);
        vi.mocked(onAuthStateChanged).mockImplementation((_auth: unknown, callback: any) => {
            callback({
                uid: "test-123",
                email: "user@example.com",
                emailVerified: true,
                isAnonymous: false,
                reload: vi.fn(() => Promise.resolve()),
            });
            return vi.fn();
        });
    });

    it("renders account settings heading", async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByText("Account Settings")).toBeInTheDocument();
        });
    });

    it("displays user email", async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByText("user@example.com")).toBeInTheDocument();
        });
    });

    it("renders log out and delete account buttons", async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
        });
    });

    it("calls LogOut when log out button is clicked", async () => {
        const user = userEvent.setup();
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /log out/i }));

        expect(mockLogOut).toHaveBeenCalledWith(mockRouter);
    });

    it("shows delete confirmation dialog", async () => {
        const user = userEvent.setup();
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /delete account/i }));

        await waitFor(() => {
            expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        });
    });

    it("calls DeleteUser and redirects on successful deletion", async () => {
        mockDeleteUser.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /delete account/i }));

        await waitFor(() => {
            expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        });

        const confirmButtons = screen.getAllByRole("button", { name: /delete account/i });
        const dialogConfirm = confirmButtons.find(btn =>
            btn.closest('[role="alertdialog"]')
        );
        await user.click(dialogConfirm!);

        await waitFor(() => {
            expect(mockDeleteUser).toHaveBeenCalled();
            expect(screen.getByText("Deleting your account...")).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/");
        });
    });

    it("handles requires-recent-login error on delete and returns to settings", async () => {
        const error = new Error("Requires recent login") as Error & { code: string };
        error.code = "auth/requires-recent-login";
        mockDeleteUser.mockRejectedValue(error);
        const user = userEvent.setup();
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /delete account/i }));

        await waitFor(() => {
            expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        });

        const confirmButtons = screen.getAllByRole("button", { name: /delete account/i });
        const dialogConfirm = confirmButtons.find(btn =>
            btn.closest('[role="alertdialog"]')
        );
        await user.click(dialogConfirm!);

        await waitFor(() => {
            expect(mockDeleteUser).toHaveBeenCalled();
            expect(screen.getByText("Account Settings")).toBeInTheDocument();
            expect(screen.queryByText("Deleting your account...")).not.toBeInTheDocument();
        });
    });

    it("handles generic error on delete and returns to settings", async () => {
        mockDeleteUser.mockRejectedValue(new Error("Unknown error"));
        const user = userEvent.setup();
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /delete account/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /delete account/i }));

        await waitFor(() => {
            expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        });

        const confirmButtons = screen.getAllByRole("button", { name: /delete account/i });
        const dialogConfirm = confirmButtons.find(btn =>
            btn.closest('[role="alertdialog"]')
        );
        await user.click(dialogConfirm!);

        await waitFor(() => {
            expect(mockDeleteUser).toHaveBeenCalled();
            expect(screen.getByText("Account Settings")).toBeInTheDocument();
            expect(screen.queryByText("Deleting your account...")).not.toBeInTheDocument();
        });
    });

    it("renders email and password sections", async () => {
        render(<Settings />);

        await waitFor(() => {
            expect(screen.getByText(/email address/i)).toBeInTheDocument();
            expect(screen.getByText(/password/i)).toBeInTheDocument();
        });
    });

    it("shows edit buttons for email and password", async () => {
        render(<Settings />);

        await waitFor(() => {
            const editButtons = screen.getAllByLabelText(/^edit$/i);
            expect(editButtons.length).toBe(2);
        });
    });

    describe("change email flow", () => {
        const clickEmailEdit = async (user: ReturnType<typeof userEvent.setup>) => {
            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });
            const editButtons = screen.getAllByLabelText(/^edit$/i);
            await user.click(editButtons[0]);
        };

        it("shows email input when edit is clicked", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            await waitFor(() => {
                expect(screen.getByText("Enter your new email address")).toBeInTheDocument();
            });
        });

        it("shows cancel and save buttons when editing email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
            });
        });

        it("cancelling edit restores the email display", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
                expect(screen.queryByText("Enter your new email address")).not.toBeInTheDocument();
            });
        });

        it("shows validation error for invalid email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "invalid-email");

            await waitFor(() => {
                expect(screen.getByText("Email invalid")).toBeInTheDocument();
            });
        });

        it("save button is disabled for invalid email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "invalid-email");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
            });
        });

        it("save button is enabled for valid new email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "new@example.com");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
            });
        });

        it("save button is disabled when email is unchanged", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
            });
        });

        it("calls UpdateUserEmail and SendVerificationEmail on save and shows confirmation", async () => {
            mockUpdateUserEmail.mockResolvedValue(undefined);
            mockSendVerificationEmail.mockResolvedValue(undefined);
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "new@example.com");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
            });

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(mockUpdateUserEmail).toHaveBeenCalledWith("new@example.com", expect.objectContaining({ uid: "test-123" }));
                expect(mockSendVerificationEmail).toHaveBeenCalled();
            });

            await waitFor(() => {
                expect(screen.getByText("Email updated")).toBeInTheDocument();
                expect(screen.getByText(/new@example.com/)).toBeInTheDocument();
                expect(screen.getByText(/Please verify your new email address/)).toBeInTheDocument();
                expect(screen.getByText("Redirecting to sign in...")).toBeInTheDocument();
            });
        });

        it("redirects to login page after email update", async () => {
            vi.useFakeTimers({ shouldAdvanceTime: true });
            mockUpdateUserEmail.mockResolvedValue(undefined);
            mockSendVerificationEmail.mockResolvedValue(undefined);
            mockLogOut.mockResolvedValue(undefined);
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(<Settings />);

            await clickEmailEdit(user);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "new@example.com");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
            });

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(screen.getByText("Email updated")).toBeInTheDocument();
            });

            vi.advanceTimersByTime(8000);

            await waitFor(() => {
                expect(mockLogOut).toHaveBeenCalledWith(mockRouter, "/loginRegister?login=true&verifyEmail=true");
            });

            vi.useRealTimers();
        });

        it("handles requires-recent-login error on email update", async () => {
            const error = new Error("Requires recent login") as Error & { code: string };
            error.code = "auth/requires-recent-login";
            mockUpdateUserEmail.mockRejectedValue(error);
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "new@example.com");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
            });

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(mockUpdateUserEmail).toHaveBeenCalled();
            });
        });

        it("disables log out and delete account buttons while editing email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /log out/i })).toBeDisabled();
                expect(screen.getByRole("button", { name: /delete account/i })).toBeDisabled();
            });
        });

        it("re-enables log out and delete account buttons after cancelling email edit", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickEmailEdit(user);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /log out/i })).toBeDisabled();
            });

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /log out/i })).not.toBeDisabled();
                expect(screen.getByRole("button", { name: /delete account/i })).not.toBeDisabled();
            });
        });
    });

    describe("subscription section", () => {
        it("hides subscription section when feature flag is off", async () => {
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("Account Settings")).toBeInTheDocument();
            });
            expect(screen.queryByText("Subscription")).not.toBeInTheDocument();
        });

        it("renders subscription heading when flag is on", async () => {
            mockUseSubscription.mockReturnValue(enabledSubscription);
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByText("Subscription")).toBeInTheDocument();
            });
        });

        it("shows Free plan for non-Pro users", async () => {
            mockUseSubscription.mockReturnValue(enabledSubscription);
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByText("Free")).toBeInTheDocument();
            });
        });

        it("shows Upgrade to Pro button for free users", async () => {
            mockUseSubscription.mockReturnValue(enabledSubscription);
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /upgrade to pro/i })).toBeInTheDocument();
            });
        });

        it("shows Pro plan with Active status for Pro users", async () => {
            mockUseSubscription.mockReturnValue({
                ...enabledSubscription,
                isPro: true,
                subscriptionTier: "PRO",
                subscriptionStatus: "ACTIVE",
            });
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByText("Pro")).toBeInTheDocument();
                expect(screen.getByText("Active")).toBeInTheDocument();
            });
        });

        it("shows Manage subscription button for Pro users", async () => {
            mockUseSubscription.mockReturnValue({
                ...enabledSubscription,
                isPro: true,
                subscriptionTier: "PRO",
                subscriptionStatus: "ACTIVE",
            });
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /manage subscription/i })).toBeInTheDocument();
            });
        });

        it("shows renewal date for active Pro users", async () => {
            mockUseSubscription.mockReturnValue({
                ...enabledSubscription,
                isPro: true,
                subscriptionTier: "PRO",
                subscriptionStatus: "ACTIVE",
            });
            render(<Settings />, {
                authContext: {
                    userProfile: {
                        subscriptionExpiresAt: new Date("2027-01-15"),
                    } as any,
                },
            });

            await waitFor(() => {
                expect(screen.getByText("Renews")).toBeInTheDocument();
                expect(screen.getByText("15 January 2027")).toBeInTheDocument();
            });
        });

        it("shows 'Access until' label for cancelled subscriptions", async () => {
            mockUseSubscription.mockReturnValue({
                ...enabledSubscription,
                isPro: true,
                subscriptionTier: "PRO",
                subscriptionStatus: "CANCELED",
            });
            render(<Settings />, {
                authContext: {
                    userProfile: {
                        subscriptionExpiresAt: new Date("2027-01-15"),
                    } as any,
                },
            });

            await waitFor(() => {
                expect(screen.getByText("Access until")).toBeInTheDocument();
                expect(screen.getByText("Cancelled")).toBeInTheDocument();
            });
        });

        it("shows Past due status", async () => {
            mockUseSubscription.mockReturnValue({
                ...enabledSubscription,
                isPro: true,
                subscriptionTier: "PRO",
                subscriptionStatus: "PAST_DUE",
            });
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByText("Past due")).toBeInTheDocument();
            });
        });

        it("calls createCheckoutSession when Upgrade to Pro is clicked", async () => {
            mockUseSubscription.mockReturnValue(enabledSubscription);
            const mockCreateCheckout = vi.mocked(createCheckoutSession);
            const user = userEvent.setup();
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /upgrade to pro/i })).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /upgrade to pro/i }));

            await waitFor(() => {
                expect(mockCreateCheckout).toHaveBeenCalledWith({ userId: "test-123" });
            });
        });

        it("calls createPortalSession when Manage subscription is clicked", async () => {
            mockUseSubscription.mockReturnValue({
                ...enabledSubscription,
                isPro: true,
                subscriptionTier: "PRO",
                subscriptionStatus: "ACTIVE",
            });
            const mockCreatePortal = vi.mocked(createPortalSession);
            const user = userEvent.setup();
            render(<Settings />, { authContext: { userProfile: minimalUserProfile } });

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /manage subscription/i })).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /manage subscription/i }));

            await waitFor(() => {
                expect(mockCreatePortal).toHaveBeenCalledWith({ userId: "test-123" });
            });
        });
    });

    describe("change password flow", () => {
        const clickPasswordEdit = async (user: ReturnType<typeof userEvent.setup>) => {
            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });
            const editButtons = screen.getAllByLabelText(/^edit$/i);
            await user.click(editButtons[1]);
        };

        it("shows both password inputs when edit is clicked", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            await waitFor(() => {
                expect(screen.getByText("Enter your current password")).toBeInTheDocument();
                expect(screen.getByText("Enter your new password")).toBeInTheDocument();
            });
        });

        it("shows validation error for new password shorter than 6 characters", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            const inputs = screen.getAllByDisplayValue("");
            await user.type(inputs[1], "short");

            await waitFor(() => {
                expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
            });
        });

        it("save button is disabled when only new password is filled", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            const inputs = screen.getAllByDisplayValue("");
            await user.type(inputs[1], "abcdef");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
            });
        });

        it("save button is enabled when both current and valid new password are filled", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            const inputs = screen.getAllByDisplayValue("");
            await user.type(inputs[0], "oldpass123");
            await user.type(inputs[1], "newpass123");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
            });
        });

        it("save button is disabled for short new password", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            const inputs = screen.getAllByDisplayValue("");
            await user.type(inputs[0], "oldpass123");
            await user.type(inputs[1], "abc");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
            });
        });

        it("calls UpdateUserPassword with both passwords on save", async () => {
            mockUpdateUserPassword.mockResolvedValue(undefined);
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            const inputs = screen.getAllByDisplayValue("");
            await user.type(inputs[0], "oldpass123");
            await user.type(inputs[1], "newpassword123");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
            });

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(mockUpdateUserPassword).toHaveBeenCalledWith("oldpass123", "newpassword123", expect.objectContaining({ uid: "test-123" }));
            });
        });

        it("shows error when current password is wrong", async () => {
            const error = new Error("Wrong password") as Error & { code: string };
            error.code = "auth/wrong-password";
            mockUpdateUserPassword.mockRejectedValue(error);
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            const inputs = screen.getAllByDisplayValue("");
            await user.type(inputs[0], "wrongpass");
            await user.type(inputs[1], "newpassword123");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /save/i })).not.toBeDisabled();
            });

            await user.click(screen.getByRole("button", { name: /save/i }));

            await waitFor(() => {
                expect(screen.getByText("Current password is incorrect.")).toBeInTheDocument();
            });
        });

        it("cancelling password edit restores password mask", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            await waitFor(() => {
                expect(screen.getByText("Enter your new password")).toBeInTheDocument();
            });

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });
        });

        it("toggles password visibility for both fields", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            const inputs = screen.getAllByDisplayValue("");
            await user.type(inputs[0], "secret");

            const toggleButton = screen.getByLabelText("Toggle password visibility");
            expect(inputs[0]).toHaveAttribute("type", "password");
            expect(inputs[1]).toHaveAttribute("type", "password");

            await user.click(toggleButton);
            expect(inputs[0]).toHaveAttribute("type", "text");
            expect(inputs[1]).toHaveAttribute("type", "text");

            await user.click(toggleButton);
            expect(inputs[0]).toHaveAttribute("type", "password");
            expect(inputs[1]).toHaveAttribute("type", "password");
        });

        it("disables log out and delete account buttons while editing password", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /log out/i })).toBeDisabled();
                expect(screen.getByRole("button", { name: /delete account/i })).toBeDisabled();
            });
        });

        it("re-enables log out and delete account buttons after cancelling password edit", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await clickPasswordEdit(user);

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /log out/i })).toBeDisabled();
            });

            await user.click(screen.getByRole("button", { name: /cancel/i }));

            await waitFor(() => {
                expect(screen.getByRole("button", { name: /log out/i })).not.toBeDisabled();
                expect(screen.getByRole("button", { name: /delete account/i })).not.toBeDisabled();
            });
        });
    });
});
