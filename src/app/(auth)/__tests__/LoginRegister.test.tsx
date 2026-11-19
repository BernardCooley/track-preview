import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import { mockRouter, mockSearchParams } from "../../../../test/mocks/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

vi.mock("../../../../firebase/firebaseInit", () => ({
    auth: { currentUser: null },
    provider: {},
}));

vi.mock("../../../../firebase/utils", () => ({
    LoginUser: vi.fn(),
    LogOut: vi.fn(),
    RegisterUser: vi.fn(),
    SignInAnonymously: vi.fn(),
    LinkAnonymousAccount: vi.fn(),
    DeleteUser: vi.fn(),
    SendVerificationEmail: vi.fn(() => Promise.resolve()),
    ResetPassword: vi.fn(() => Promise.resolve()),
    GetCurrentUser: vi.fn(() => Promise.resolve(null)),
    UpdateUserEmail: vi.fn(() => Promise.resolve()),
    UpdateUserPassword: vi.fn(() => Promise.resolve()),
}));

vi.mock("firebase/auth", () => ({
    getAuth: vi.fn(() => ({ currentUser: null })),
    onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: FirebaseUser | null) => void) => {
        callback(null);
        return vi.fn();
    }),
    signOut: vi.fn(() => Promise.resolve()),
    EmailAuthProvider: { credential: vi.fn() },
    sendEmailVerification: vi.fn(() => Promise.resolve()),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
}));

const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);

const resetSearchParams = () => {
    Array.from(mockSearchParams.keys()).forEach(key => mockSearchParams.delete(key));
};

const loadPage = async () => {
    const mod = await import("../loginRegister/page");
    return mod.default;
};

describe("LoginRegister", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetSearchParams();
        mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: any) => {
            callback(null);
            return vi.fn();
        });
    });

    it("shows sign in and register tabs", async () => {
        mockSearchParams.set("login", "true");
        const AuthPage = await loadPage();
        render(<AuthPage />);

        await waitFor(() => {
            expect(screen.getByRole("tab", { name: /sign in/i })).toBeInTheDocument();
            expect(screen.getByRole("tab", { name: /register/i })).toBeInTheDocument();
        });
    });

    it("shows register tab when login=false", async () => {
        mockSearchParams.set("login", "false");
        const AuthPage = await loadPage();
        render(<AuthPage />);

        await waitFor(() => {
            const registerTab = screen.getByRole("tab", { name: /register/i });
            expect(registerTab).toHaveAttribute("aria-selected", "true");
        });
    });

    it("shows sign in tab when login=true", async () => {
        mockSearchParams.set("login", "true");
        const AuthPage = await loadPage();
        render(<AuthPage />);

        await waitFor(() => {
            const signInTab = screen.getByRole("tab", { name: /sign in/i });
            expect(signInTab).toHaveAttribute("aria-selected", "true");
        });
    });

    it("does not redirect unverified users to explore", async () => {
        mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: any) => {
            callback({
                uid: "test-123",
                email: "test@example.com",
                emailVerified: false,
                isAnonymous: false,
            });
            return vi.fn();
        });
        mockSearchParams.set("login", "true");
        const AuthPage = await loadPage();
        render(<AuthPage />);

        await waitFor(() => {
            expect(screen.getByText("Sign in")).toBeInTheDocument();
        });

        expect(mockRouter.push).not.toHaveBeenCalledWith("/explore");
    });

    it("redirects verified users to explore", async () => {
        mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: any) => {
            callback({
                uid: "test-123",
                email: "test@example.com",
                emailVerified: true,
                isAnonymous: false,
            });
            return vi.fn();
        });
        mockSearchParams.set("login", "true");
        const AuthPage = await loadPage();
        render(<AuthPage />);

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/explore");
        });
    });

    it("shows verify email banner when verifyEmail param is set", async () => {
        mockSearchParams.set("login", "true");
        mockSearchParams.set("verifyEmail", "true");
        const AuthPage = await loadPage();
        render(<AuthPage />);

        await waitFor(() => {
            expect(screen.getByText("Email not verified")).toBeInTheDocument();
            expect(screen.getByText(/check your inbox for a verification link/i)).toBeInTheDocument();
        });
    });

    it("dismisses verify email banner when dismiss button is clicked", async () => {
        mockSearchParams.set("login", "true");
        mockSearchParams.set("verifyEmail", "true");
        const AuthPage = await loadPage();
        const user = userEvent.setup();
        render(<AuthPage />);

        await waitFor(() => {
            expect(screen.getByText("Email not verified")).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /dismiss/i }));

        await waitFor(() => {
            expect(screen.queryByText("Email not verified")).not.toBeInTheDocument();
        });
    });

    it("does not show verify email banner without the param", async () => {
        mockSearchParams.set("login", "true");
        const AuthPage = await loadPage();
        render(<AuthPage />);

        await waitFor(() => {
            expect(screen.getByText("Sign in")).toBeInTheDocument();
        });

        expect(screen.queryByText("Email not verified")).not.toBeInTheDocument();
    });
});
