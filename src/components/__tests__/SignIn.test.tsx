import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import SignIn from "../SignIn";
import { LoginUser } from "../../../firebase/utils";
import { signOut } from "firebase/auth";
import { mockRouter } from "../../../test/mocks/navigation";
import type { UserCredential, User as FirebaseUser } from "firebase/auth";

const mockLoginUser = vi.mocked(LoginUser);
const mockSignOut = vi.mocked(signOut);

const makeCredential = (overrides: Partial<FirebaseUser> = {}): UserCredential =>
    ({
        user: {
            uid: "test-123",
            email: "test@example.com",
            emailVerified: true,
            isAnonymous: false,
            ...overrides,
        },
    } as UserCredential);

describe("SignIn", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders email and password fields", () => {
        render(<SignIn />);
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Password")).toBeInTheDocument();
    });

    it("renders sign in button", () => {
        render(<SignIn />);
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("shows validation errors for empty form submission", async () => {
        const user = userEvent.setup();
        render(<SignIn />);

        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockLoginUser).not.toHaveBeenCalled();
        });
    });

    it("calls LoginUser with email and password on valid submission", async () => {
        mockLoginUser.mockResolvedValue(makeCredential());
        const user = userEvent.setup();
        render(<SignIn />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        const passwordInput = document.querySelector('input[type="password"]')!;

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockLoginUser).toHaveBeenCalledWith("test@example.com", "password123");
        });
    });

    it("redirects to /explore on successful login with verified email", async () => {
        mockLoginUser.mockResolvedValue(makeCredential({ emailVerified: true }));
        const user = userEvent.setup();
        render(<SignIn />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        const passwordInput = document.querySelector('input[type="password"]')!;

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/explore");
        });
    });

    it("signs out and shows inline error for unverified email", async () => {
        mockLoginUser.mockResolvedValue(makeCredential({ emailVerified: false }));
        const user = userEvent.setup();
        render(<SignIn />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        const passwordInput = document.querySelector('input[type="password"]')!;

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalled();
            expect(mockRouter.push).not.toHaveBeenCalledWith("/explore");
            expect(screen.getByText(/email address has not been verified/i)).toBeInTheDocument();
        });
    });

    it("does not redirect to explore when email is not verified", async () => {
        mockLoginUser.mockResolvedValue(makeCredential({ emailVerified: false }));
        const user = userEvent.setup();
        render(<SignIn />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        const passwordInput = document.querySelector('input[type="password"]')!;

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalled();
        });

        expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it("shows error message on login failure", async () => {
        mockLoginUser.mockRejectedValue(new Error("auth/wrong-password"));
        const user = userEvent.setup();
        render(<SignIn />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        const passwordInput = document.querySelector('input[type="password"]')!;

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "wrongpassword");
        await user.click(screen.getByRole("button", { name: /sign in/i }));

        await waitFor(() => {
            expect(screen.getByText(/error signing in/i)).toBeInTheDocument();
        });
    });

    it("shows forgot password link", () => {
        render(<SignIn />);
        expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    });
});
