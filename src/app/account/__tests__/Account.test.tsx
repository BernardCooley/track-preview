import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import Settings from "../page";
import { DeleteUser, LogOut, UpdateUserEmail, UpdateUserPassword, SendVerificationEmail } from "../../../../firebase/utils";
import { onAuthStateChanged, getAuth } from "firebase/auth";
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

const mockCurrentUser = {
    uid: "test-123",
    email: "user@example.com",
    emailVerified: true,
    isAnonymous: false,
} as FirebaseUser;

vi.mock("firebase/auth", () => ({
    getAuth: vi.fn(() => ({ currentUser: mockCurrentUser })),
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
const mockUpdateUserEmail = vi.mocked(UpdateUserEmail);
const mockUpdateUserPassword = vi.mocked(UpdateUserPassword);
const mockSendVerificationEmail = vi.mocked(SendVerificationEmail);
const mockGetAuth = vi.mocked(getAuth);

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

    describe("change email flow", () => {
        it("shows email input when edit is clicked", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByText("Enter your new email address")).toBeInTheDocument();
            });
        });

        it("shows cancel button when editing email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByLabelText(/cancel/i)).toBeInTheDocument();
            });
        });

        it("cancelling edit restores the email display", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByLabelText(/cancel/i)).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText(/cancel/i));

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });
        });

        it("shows validation error for invalid email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "invalid-email");

            await waitFor(() => {
                expect(screen.getByText("Email invalid")).toBeInTheDocument();
            });
        });

        it("does not show save button for invalid email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "invalid-email");

            await waitFor(() => {
                expect(screen.queryByLabelText("Save")).not.toBeInTheDocument();
            });
        });

        it("shows save button for valid new email", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "new@example.com");

            await waitFor(() => {
                expect(screen.getByLabelText("Save")).toBeInTheDocument();
            });
        });

        it("does not show save button when email is unchanged", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            expect(screen.queryByLabelText("Save")).not.toBeInTheDocument();
        });

        it("calls UpdateUserEmail and SendVerificationEmail on save", async () => {
            mockUpdateUserEmail.mockResolvedValue(undefined);
            mockSendVerificationEmail.mockResolvedValue(undefined);
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "new@example.com");

            await waitFor(() => {
                expect(screen.getByLabelText("Save")).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText("Save"));

            await waitFor(() => {
                expect(mockUpdateUserEmail).toHaveBeenCalledWith("new@example.com", expect.objectContaining({ uid: "test-123" }));
                expect(mockSendVerificationEmail).toHaveBeenCalled();
            });
        });

        it("handles requires-recent-login error on email update", async () => {
            const error = new Error("Requires recent login") as Error & { code: string };
            error.code = "auth/requires-recent-login";
            mockUpdateUserEmail.mockRejectedValue(error);
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("user@example.com")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[0]);

            const input = screen.getByDisplayValue("user@example.com");
            await user.clear(input);
            await user.type(input, "new@example.com");

            await waitFor(() => {
                expect(screen.getByLabelText("Save")).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText("Save"));

            await waitFor(() => {
                expect(mockUpdateUserEmail).toHaveBeenCalled();
            });
        });
    });

    describe("change password flow", () => {
        it("shows password input when edit is clicked", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            await waitFor(() => {
                expect(screen.getByText("Enter your new password")).toBeInTheDocument();
            });
        });

        it("shows validation error for password shorter than 6 characters", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            const input = screen.getByDisplayValue("");
            await user.type(input, "short");

            await waitFor(() => {
                expect(screen.getByText("Password must be at least 6 characters long.")).toBeInTheDocument();
            });
        });

        it("accepts a password of exactly 6 characters", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            const input = screen.getByDisplayValue("");
            await user.type(input, "abcdef");

            await waitFor(() => {
                expect(screen.queryByText("Password must be at least 6 characters long.")).not.toBeInTheDocument();
                expect(screen.getByLabelText("Save")).toBeInTheDocument();
            });
        });

        it("does not show save button for short password", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            const input = screen.getByDisplayValue("");
            await user.type(input, "abc");

            await waitFor(() => {
                expect(screen.queryByLabelText("Save")).not.toBeInTheDocument();
            });
        });

        it("calls UpdateUserPassword on save", async () => {
            mockUpdateUserPassword.mockResolvedValue(undefined);
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            const input = screen.getByDisplayValue("");
            await user.type(input, "newpassword123");

            await waitFor(() => {
                expect(screen.getByLabelText("Save")).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText("Save"));

            await waitFor(() => {
                expect(mockUpdateUserPassword).toHaveBeenCalledWith("newpassword123", expect.objectContaining({ uid: "test-123" }));
            });
        });

        it("handles requires-recent-login error on password update", async () => {
            const error = new Error("Requires recent login") as Error & { code: string };
            error.code = "auth/requires-recent-login";
            mockUpdateUserPassword.mockRejectedValue(error);
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            const input = screen.getByDisplayValue("");
            await user.type(input, "newpassword123");

            await waitFor(() => {
                expect(screen.getByLabelText("Save")).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText("Save"));

            await waitFor(() => {
                expect(mockUpdateUserPassword).toHaveBeenCalled();
            });
        });

        it("cancelling password edit restores password mask", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            await waitFor(() => {
                expect(screen.getByText("Enter your new password")).toBeInTheDocument();
            });

            await user.click(screen.getByLabelText(/cancel/i));

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });
        });

        it("toggles password visibility", async () => {
            const user = userEvent.setup();
            render(<Settings />);

            await waitFor(() => {
                expect(screen.getByText("**********")).toBeInTheDocument();
            });

            const editButtons = screen.getAllByLabelText(/edit/i);
            await user.click(editButtons[1]);

            const input = screen.getByDisplayValue("");
            await user.type(input, "secret");

            const toggleButton = screen.getByLabelText("Toggle password visibility");
            expect(input).toHaveAttribute("type", "password");

            await user.click(toggleButton);
            expect(input).toHaveAttribute("type", "text");

            await user.click(toggleButton);
            expect(input).toHaveAttribute("type", "password");
        });
    });
});
