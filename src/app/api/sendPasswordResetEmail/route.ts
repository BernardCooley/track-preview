import { adminAuth } from "../../../../firebase/firebaseAdmin";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email } = await req.json();

    try {
        const link = await adminAuth.generatePasswordResetLink(email, {
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.phoniquest.com"}/loginRegister?login=true`,
        });

        await sendPasswordResetEmail(email, link);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Failed to send password reset email:", error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
