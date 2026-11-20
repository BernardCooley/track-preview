import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "../../../../test/mocks/navigation";
import { render } from "../../../../test/test-utils";
import PasswordReset from "../resetPassword/page";
import { sendPasswordResetEmail } from "@/bff/bff";
import { mockRouter } from "../../../../test/mocks/navigation";

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
    GetCurrentUser: vi.fn(() => Promise.resolve(null)),
    UpdateUserEmail: vi.fn(() => Promise.resolve()),
    UpdateUserPassword: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/bff/bff", () => ({
    sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
}));

const mockResetPassword = vi.mocked(sendPasswordResetEmail);

describe("PasswordReset", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders email field and reset button", () => {
        render(<PasswordReset />);
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /reset password/i })).toBeInTheDocument();
    });

    it("renders helper text", () => {
        render(<PasswordReset />);
        expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    });

    it("renders back button", () => {
        render(<PasswordReset />);
        expect(screen.getByLabelText(/back to login/i)).toBeInTheDocument();
    });

    it("does not call ResetPassword with invalid email", async () => {
        const user = userEvent.setup();
        render(<PasswordReset />);

        await user.click(screen.getByRole("button", { name: /reset password/i }));

        await waitFor(() => {
            expect(mockResetPassword).not.toHaveBeenCalled();
        });
    });

    it("calls ResetPassword and redirects on success", async () => {
        mockResetPassword.mockResolvedValue(undefined);
        const user = userEvent.setup();
        render(<PasswordReset />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        await user.type(emailInput, "test@example.com");
        await user.click(screen.getByRole("button", { name: /reset password/i }));

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith("test@example.com");
            expect(mockRouter.push).toHaveBeenCalledWith("/loginRegister?login=true&passwordReset=true");
        });
    });

    it("shows error message and does not redirect on failure", async () => {
        mockResetPassword.mockRejectedValue(new Error("Failed"));
        const user = userEvent.setup();
        render(<PasswordReset />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        await user.type(emailInput, "test@example.com");
        await user.click(screen.getByRole("button", { name: /reset password/i }));

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalled();
            expect(screen.getByText(/error sending password reset email/i)).toBeInTheDocument();
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });

    it("re-enables submit button after failure", async () => {
        mockResetPassword.mockRejectedValue(new Error("Failed"));
        const user = userEvent.setup();
        render(<PasswordReset />);

        const emailInput = screen.getByRole("textbox", { name: /email/i });
        await user.type(emailInput, "test@example.com");

        const submitButton = screen.getByRole("button", { name: /reset password/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    it("navigates back to login on back button click", async () => {
        const user = userEvent.setup();
        render(<PasswordReset />);

        await user.click(screen.getByLabelText(/back to login/i));

        expect(mockRouter.push).toHaveBeenCalledWith("/loginRegister?login=true");
    });
});
