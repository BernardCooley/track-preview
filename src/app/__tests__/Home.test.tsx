import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import { mockRouter } from "../../../test/mocks/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";

vi.mock("../../../firebase/firebaseInit", () => ({
    auth: { currentUser: null },
    provider: {},
}));

vi.mock("../../../firebase/utils", () => ({
    SignInAnonymously: vi.fn(),
    LoginUser: vi.fn(),
    LogOut: vi.fn(),
    RegisterUser: vi.fn(),
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
    signInAnonymously: vi.fn(),
}));

const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);

const loadPage = async () => {
    const mod = await import("../page");
    return mod.default;
};

describe("Home (Splash)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: any) => {
            callback(null);
            return vi.fn();
        });
    });

    it("shows splash screen when no user is signed in", async () => {
        const Home = await loadPage();
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText("Get Started")).toBeInTheDocument();
        });
    });

    it("redirects to /explore when a user is signed in", async () => {
        mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: any) => {
            callback({ uid: "test-123", email: "test@example.com" });
            return vi.fn();
        });

        const Home = await loadPage();
        render(<Home />);

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith("/explore");
        });
    });

    it("unsubscribes onAuthStateChanged listener on unmount", async () => {
        const unsubscribe = vi.fn();
        mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: any) => {
            callback(null);
            return unsubscribe;
        });

        const Home = await loadPage();
        const { unmount } = render(<Home />);

        await waitFor(() => {
            expect(screen.getByText("Get Started")).toBeInTheDocument();
        });

        unmount();
        expect(unsubscribe).toHaveBeenCalled();
    });

    it("shows sign in and register buttons", async () => {
        const Home = await loadPage();
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
        });
    });

    it("navigates to /loginRegister?login=true when sign in is clicked", async () => {
        const Home = await loadPage();
        const user = userEvent.setup();
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        });

        await user.click(screen.getByRole("button", { name: /sign in/i }));

        expect(mockRouter.push).toHaveBeenCalledWith("/loginRegister?login=true");
    });

    it("opens trial dialog when Get Started is clicked and no user in context", async () => {
        const Home = await loadPage();
        const user = userEvent.setup();
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByText("Get Started")).toBeInTheDocument();
        });

        await user.click(screen.getByText("Get Started"));

        await waitFor(() => {
            expect(screen.getByText("Try without an account")).toBeInTheDocument();
        });
    });

    it("navigates to /explore when Get Started is clicked and user exists in context", async () => {
        const Home = await loadPage();
        const user = userEvent.setup();
        render(<Home />, {
            authContext: {
                user: { uid: "ctx-user", email: "ctx@example.com" },
            },
        });

        await waitFor(() => {
            expect(screen.getByText("Get Started")).toBeInTheDocument();
        });

        await user.click(screen.getByText("Get Started"));

        expect(mockRouter.push).toHaveBeenCalledWith("/explore");
    });
});
