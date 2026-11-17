import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    try {
        const headers: Record<string, string> = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Encoding": "identity",
            "Referer": "https://www.deezer.com/",
            "Origin": "https://www.deezer.com",
        };

        const rangeHeader = req.headers.get("Range");
        if (rangeHeader) {
            headers["Range"] = rangeHeader;
        }

        const response = await fetch(url, { headers });

        if (!response.ok && response.status !== 206) {
            return NextResponse.json(
                { error: `Upstream returned ${response.status}` },
                { status: response.status }
            );
        }

        const audioBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("Content-Type") || "audio/mpeg";
        const contentRange = response.headers.get("Content-Range");

        const responseHeaders: Record<string, string> = {
            "Content-Type": contentType,
            "Content-Length": String(audioBuffer.byteLength),
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400",
        };

        if (contentRange) {
            responseHeaders["Content-Range"] = contentRange;
        }

        return new NextResponse(audioBuffer, {
            status: response.status === 206 ? 206 : 200,
            headers: responseHeaders,
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Proxy failed" },
            { status: 500 }
        );
    }
}
