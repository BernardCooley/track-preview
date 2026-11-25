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
    LoginUser: vi.fn(),
    LogOut: vi.fn(),
    RegisterUser: vi.fn(),
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
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
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
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
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

    it("renders JSON-LD structured data", async () => {
        const Home = await loadPage();
        const { container } = render(<Home />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        });

        const script = container.querySelector('script[type="application/ld+json"]');
        expect(script).toBeInTheDocument();

        const jsonLd = JSON.parse(script!.textContent!);
        expect(jsonLd["@type"]).toBe("WebApplication");
        expect(jsonLd.name).toBe("Phoniquest");
        expect(jsonLd.applicationCategory).toBe("MusicApplication");
        expect(jsonLd.url).toBe("https://www.phoniquest.com");
    });

    it("uses semantic HTML elements", async () => {
        const Home = await loadPage();
        const { container } = render(<Home />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        });

        expect(container.querySelector("main")).toBeInTheDocument();
        expect(container.querySelector("header")).toBeInTheDocument();
        expect(container.querySelector("footer")).toBeInTheDocument();
        expect(container.querySelector("nav")).toBeInTheDocument();
        expect(container.querySelector("h1")).toBeInTheDocument();
        expect(container.querySelector("ul")).toBeInTheDocument();
        expect(container.querySelectorAll("li").length).toBeGreaterThan(0);
    });

    it("renders the heading as an h1 with the app name", async () => {
        const Home = await loadPage();
        render(<Home />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
        });

        const h1 = screen.getByRole("heading", { level: 1 });
        expect(h1).toHaveTextContent("PHONIQUEST");
    });
});
