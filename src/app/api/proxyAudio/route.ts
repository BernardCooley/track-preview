import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "Missing url param" }, { status: 400 });
    }

    try {
        const upstream = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "*/*",
                "Accept-Encoding": "identity",
                "Referer": "https://www.deezer.com/",
                "Origin": "https://www.deezer.com",
            },
        });

        if (!upstream.ok) {
            return NextResponse.json(
                { error: `Upstream returned ${upstream.status}` },
                { status: upstream.status }
            );
        }

        const fullBuffer = await upstream.arrayBuffer();
        const total = fullBuffer.byteLength;
        const contentType = upstream.headers.get("Content-Type") || "audio/mpeg";

        const rangeHeader = req.headers.get("Range");
        if (rangeHeader) {
            const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (match) {
                const start = parseInt(match[1], 10);
                const end = match[2] ? parseInt(match[2], 10) : total - 1;
                const slice = fullBuffer.slice(start, end + 1);

                return new NextResponse(slice, {
                    status: 206,
                    headers: {
                        "Content-Type": contentType,
                        "Content-Length": String(slice.byteLength),
                        "Content-Range": `bytes ${start}-${end}/${total}`,
                        "Accept-Ranges": "bytes",
                        "Cache-Control": "public, max-age=86400",
                    },
                });
            }
        }

        return new NextResponse(fullBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(total),
                "Accept-Ranges": "bytes",
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
