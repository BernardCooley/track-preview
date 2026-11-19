import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import { render } from "../../../test/test-utils";
import SignUp from "../SignUp";
import { RegisterUser, SendVerificationEmail } from "../../../firebase/utils";
import { auth } from "../../../firebase/firebaseInit";
import type { UserCredential, User as FirebaseUser } from "firebase/auth";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/mocks/server";

const mockRegisterUser = vi.mocked(RegisterUser);
const mockSendVerificationEmail = vi.mocked(SendVerificationEmail);

const makeCredential = (overrides: Partial<FirebaseUser> = {}): UserCredential => {
    const mockUser = {
        uid: "new-user-123",
        email: "new@example.com",
        emailVerified: false,
        isAnonymous: false,
        delete: vi.fn(() => Promise.resolve()),
        ...overrides,
    };
    return { user: mockUser } as unknown as UserCredential;
};

const fillAndSubmitForm = async (
    user: ReturnType<typeof userEvent.setup>,
    email = "new@example.com",
    password = "password123"
) => {
    const emailInput = screen.getByRole("textbox", { name: /email/i });
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    await user.type(emailInput, email);
    await user.type(passwordInputs[0], password);
    await user.type(passwordInputs[1], password);
    await user.click(screen.getByRole("button", { name: /register/i }));
};

describe("SignUp", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(auth, "currentUser", { value: null, writable: true });
    });

    it("renders email, password, and confirm password fields", () => {
        render(<SignUp />);
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("Password")).toBeInTheDocument();
        expect(screen.getByText("Confirm password")).toBeInTheDocument();
    });

    it("renders register button", () => {
        render(<SignUp />);
        expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    it("does not call RegisterUser when form is empty", async () => {
        const user = userEvent.setup();
        render(<SignUp />);

        await user.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(mockRegisterUser).not.toHaveBeenCalled();
        });
    });

    it("shows success message on successful registration", async () => {
        mockRegisterUser.mockResolvedValue(makeCredential());
        mockSendVerificationEmail.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<SignUp />);

        await fillAndSubmitForm(user);

        await waitFor(() => {
            expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
            expect(screen.getByText(/new@example.com/)).toBeInTheDocument();
        });
    });

    it("calls RegisterUser with email and password", async () => {
        mockRegisterUser.mockResolvedValue(makeCredential());
        mockSendVerificationEmail.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<SignUp />);

        await fillAndSubmitForm(user, "test@test.com", "mypassword");

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith("test@test.com", "mypassword");
        });
    });

    it("sends verification email after successful registration", async () => {
        const cred = makeCredential();
        mockRegisterUser.mockResolvedValue(cred);
        mockSendVerificationEmail.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<SignUp />);

        await fillAndSubmitForm(user);

        await waitFor(() => {
            expect(mockSendVerificationEmail).toHaveBeenCalledWith(cred.user);
        });
    });

    it("shows error for email already in use", async () => {
        const error = new Error("Email already in use") as Error & { code: string };
        error.code = "auth/email-already-in-use";
        mockRegisterUser.mockRejectedValue(error);
        const user = userEvent.setup();
        render(<SignUp />);

        await fillAndSubmitForm(user);

        await waitFor(() => {
            expect(screen.getByText(/already registered/i)).toBeInTheDocument();
        });
    });

    it("shows generic error for other registration failures", async () => {
        mockRegisterUser.mockRejectedValue(new Error("Unknown error"));
        const user = userEvent.setup();
        render(<SignUp />);

        await fillAndSubmitForm(user);

        await waitFor(() => {
            expect(screen.getByText(/error registering/i)).toBeInTheDocument();
        });
    });

    it("cleans up Firebase user when Postgres createUser fails", async () => {
        const cred = makeCredential();
        mockRegisterUser.mockResolvedValue(cred);

        server.use(
            http.post("/api/createUser", () => {
                return HttpResponse.json({ error: "DB error" }, { status: 400 });
            })
        );

        const user = userEvent.setup();
        render(<SignUp />);

        await fillAndSubmitForm(user);

        await waitFor(() => {
            expect(cred.user.delete).toHaveBeenCalled();
            expect(screen.getByText(/error creating your account/i)).toBeInTheDocument();
        });
    });

    it("still shows success when verification email fails to send", async () => {
        mockRegisterUser.mockResolvedValue(makeCredential());
        mockSendVerificationEmail.mockRejectedValue(new Error("Email send failed"));
        const user = userEvent.setup();
        render(<SignUp />);

        await fillAndSubmitForm(user);

        await waitFor(() => {
            expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
        });
    });

    it("shows password mismatch error", async () => {
        const user = userEvent.setup();
        render(<SignUp />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        const passwordInputs = document.querySelectorAll('input[type="password"]');

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInputs[0], "password123");
        await user.type(passwordInputs[1], "differentpassword");
        await user.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
            expect(mockRegisterUser).not.toHaveBeenCalled();
        });
    });
});
