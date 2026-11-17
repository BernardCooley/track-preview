import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "identity",
                "Referer": "https://www.deezer.com/",
                "Origin": "https://www.deezer.com",
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Upstream returned ${response.status}` },
                { status: response.status }
            );
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "audio/mpeg",
                "Content-Length": String(audioBuffer.byteLength),
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Proxy failed" },
            { status: 500 }
        );
    }
}
