import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import Settings from "../page";
import { DeleteUser, LogOut } from "../../../../firebase/utils";
import { onAuthStateChanged } from "firebase/auth";
import { mockRouter } from "../../../../test/mocks/navigation";
import type { User as FirebaseUser } from "firebase/auth";

vi.mock("../../../../firebase/firebaseInit", () => ({
    auth: { currentUser: null },
    provider: {},
}));

vi.mock("../../../../firebase/utils", () => ({
    DeleteUser: vi.fn(),
    LogOut: vi.fn(),
    SendVerificationEmail: vi.fn(() => Promise.resolve()),
    UpdateUserEmail: vi.fn(() => Promise.resolve()),
    UpdateUserPassword: vi.fn(() => Promise.resolve()),
    GetCurrentUser: vi.fn(() => Promise.resolve(null)),
}));

vi.mock("firebase/auth", () => ({
    getAuth: vi.fn(() => ({ currentUser: null })),
    onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: FirebaseUser | null) => void) => {
        callback({
            uid: "test-123",
            email: "user@example.com",
            emailVerified: true,
            isAnonymous: false,
        } as FirebaseUser);
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

describe("Account Settings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(onAuthStateChanged).mockImplementation((_auth: unknown, callback: any) => {
            callback({
                uid: "test-123",
                email: "user@example.com",
                emailVerified: true,
                isAnonymous: false,
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
            expect(mockRouter.push).toHaveBeenCalledWith("/loginRegister?login=false&accountDeleted=true");
        });
    });

    it("handles requires-recent-login error on delete", async () => {
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
            const editButtons = screen.getAllByLabelText(/edit/i);
            expect(editButtons.length).toBe(2);
        });
    });
});
