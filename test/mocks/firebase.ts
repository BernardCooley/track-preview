import { vi } from "vitest";
import type { User, UserCredential } from "firebase/auth";

export const mockFirebaseUser: Partial<User> = {
    uid: "test-user-123",
    email: "test@example.com",
    emailVerified: true,
    isAnonymous: false,
    delete: vi.fn(() => Promise.resolve()),
};

export const mockUserCredential: Partial<UserCredential> = {
    user: mockFirebaseUser as User,
};

export const mockAnonymousUser: Partial<User> = {
    uid: "anon-user-456",
    email: null,
    emailVerified: false,
    isAnonymous: true,
    delete: vi.fn(() => Promise.resolve()),
};

export const mockUnverifiedUser: Partial<User> = {
    uid: "unverified-user-789",
    email: "unverified@example.com",
    emailVerified: false,
    isAnonymous: false,
    delete: vi.fn(() => Promise.resolve()),
};

vi.mock("firebase/auth", () => ({
    getAuth: vi.fn(() => ({
        currentUser: null,
    })),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(() => Promise.resolve()),
    onAuthStateChanged: vi.fn((_auth: unknown, callback: (user: User | null) => void) => {
        callback(null);
        return vi.fn();
    }),
    sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
    sendEmailVerification: vi.fn(() => Promise.resolve()),
    linkWithCredential: vi.fn(),
    EmailAuthProvider: {
        credential: vi.fn(),
    },
    updateEmail: vi.fn(() => Promise.resolve()),
    updatePassword: vi.fn(() => Promise.resolve()),
}));

vi.mock("../../firebase/firebaseInit", () => ({
    auth: { currentUser: null },
    provider: {},
}));

vi.mock("../../../firebase/firebaseInit", () => ({
    auth: { currentUser: null },
    provider: {},
}));

vi.mock("../../../../firebase/firebaseInit", () => ({
    auth: { currentUser: null },
    provider: {},
}));

vi.mock("../../firebase/utils", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../../firebase/utils");
    return {
        ...actual,
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
    };
});

vi.mock("../../../firebase/utils", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../../../firebase/utils");
    return {
        ...actual,
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
    };
});

vi.mock("../../../../firebase/utils", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../../../../firebase/utils");
    return {
        ...actual,
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
    };
});
