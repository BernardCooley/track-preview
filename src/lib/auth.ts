import { adminAuth } from "../../firebase/firebaseAdmin";
import { NextResponse } from "next/server";

interface AuthResult {
    uid: string;
}

export async function verifyAuth(req: Request): Promise<AuthResult | NextResponse> {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Missing or invalid Authorization header" },
            { status: 401 }
        );
    }

    const token = authHeader.slice(7);
    try {
        const decoded = await adminAuth.verifyIdToken(token);
        return { uid: decoded.uid };
    } catch {
        return NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 401 }
        );
    }
}

export function isAuthError(result: AuthResult | NextResponse): result is NextResponse {
    return result instanceof NextResponse;
}
