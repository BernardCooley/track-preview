import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Phoniquest — Random Music Discovery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #1a2422 0%, #0f1a17 50%, #1a2422 100%)",
                    fontFamily: "sans-serif",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        background:
                            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(17, 153, 158, 0.12) 0%, transparent 70%)",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "24px",
                    }}
                >
                    <div
                        style={{
                            fontSize: "72px",
                            fontWeight: 700,
                            color: "#f0f4f3",
                            letterSpacing: "8px",
                        }}
                    >
                        PHONIQUEST
                    </div>

                    <div
                        style={{
                            width: "80px",
                            height: "3px",
                            background: "#11999e",
                            borderRadius: "2px",
                        }}
                    />

                    <div
                        style={{
                            fontSize: "26px",
                            color: "#a8b5b2",
                            maxWidth: "600px",
                            textAlign: "center",
                            lineHeight: 1.5,
                        }}
                    >
                        No algorithms. No rankings.
                    </div>
                    <div
                        style={{
                            fontSize: "26px",
                            color: "#a8b5b2",
                            maxWidth: "600px",
                            textAlign: "center",
                            lineHeight: 1.5,
                        }}
                    >
                        Just random music discovery.
                    </div>
                </div>

                <div
                    style={{
                        position: "absolute",
                        bottom: "32px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "16px",
                        color: "#6b7d79",
                    }}
                >
                    phoniquest.com
                </div>
            </div>
        ),
        { ...size }
    );
}
