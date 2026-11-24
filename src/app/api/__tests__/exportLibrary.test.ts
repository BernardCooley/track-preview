import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../exportLibrary/route";

const mockQueryRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
    default: {
        $queryRaw: (...args: any[]) => mockQueryRaw(...args),
    },
}));

function makeRequest(body: object) {
    return new Request("http://localhost/api/exportLibrary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}

const sampleTracks = [
    {
        title: "Track One",
        artist: "Artist A",
        releaseTitle: "EP One",
        genre: "Techno",
        releaseYear: 2023,
        releaseDate: "2023-03-15",
        purchased: true,
        notes: "Great track",
        addedAt: new Date("2024-06-10T12:00:00Z"),
    },
    {
        title: "Track Two",
        artist: "Artist B",
        releaseTitle: "LP Two",
        genre: "House",
        releaseYear: 2022,
        releaseDate: "2022-08-01",
        purchased: false,
        notes: null,
        addedAt: new Date("2024-01-20T08:30:00Z"),
    },
];

describe("exportLibrary", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when userId is missing", async () => {
        const res = await POST(makeRequest({}));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("userId is required");
    });

    it("returns 400 for invalid format", async () => {
        const res = await POST(makeRequest({ userId: "user-1", format: "xml" }));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe("format must be 'csv' or 'json'");
    });

    it("returns 404 for empty library", async () => {
        mockQueryRaw.mockResolvedValueOnce([]);
        const res = await POST(makeRequest({ userId: "user-1" }));
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toBe("Library is empty");
    });

    it("exports as CSV by default", async () => {
        mockQueryRaw.mockResolvedValueOnce(sampleTracks);

        const res = await POST(makeRequest({ userId: "user-1" }));
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/csv");
        expect(res.headers.get("Content-Disposition")).toContain("phoniquest-library.csv");

        const csv = await res.text();
        const lines = csv.split("\n");
        expect(lines[0]).toBe(
            "Title,Artist,Release,Genre,Year,Release Date,Purchased,Notes,Date Added"
        );
        expect(lines.length).toBe(3);
        expect(lines[1]).toContain("Track One");
        expect(lines[1]).toContain("Yes");
        expect(lines[1]).toContain("Great track");
        expect(lines[1]).toContain("Mar 15, 2023");
        expect(lines[1]).toContain("Jun 10, 2024");
        expect(lines[2]).toContain("Track Two");
        expect(lines[2]).toContain("No");
        expect(lines[2]).toContain("Aug 1, 2022");
    });

    it("exports as JSON when requested", async () => {
        mockQueryRaw.mockResolvedValueOnce(sampleTracks);

        const res = await POST(makeRequest({ userId: "user-1", format: "json" }));
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("application/json");
        expect(res.headers.get("Content-Disposition")).toContain("phoniquest-library.json");

        const json = JSON.parse(await res.text());
        expect(json).toHaveLength(2);
        expect(json[0].title).toBe("Track One");
        expect(json[0].releaseDate).toBe("Mar 15, 2023");
        expect(json[0].addedAt).toBe("Jun 10, 2024");
        expect(json[1].title).toBe("Track Two");
    });

    it("correctly escapes CSV fields with commas and quotes", async () => {
        mockQueryRaw.mockResolvedValueOnce([
            {
                title: 'Track "Special"',
                artist: "Artist, With Comma",
                releaseTitle: "Normal",
                genre: "Techno",
                releaseYear: 2023,
                releaseDate: "2023-01-01",
                purchased: false,
                notes: "Has\nnewline",
                addedAt: new Date("2024-02-14T00:00:00Z"),
            },
        ]);

        const res = await POST(makeRequest({ userId: "user-1", format: "csv" }));
        const csv = await res.text();
        expect(csv).toContain('"Track ""Special"""');
        expect(csv).toContain('"Artist, With Comma"');
        expect(csv).toContain('"Has\nnewline"');
    });

    it("includes correct fields in JSON export", async () => {
        mockQueryRaw.mockResolvedValueOnce([sampleTracks[0]]);

        const res = await POST(makeRequest({ userId: "user-1", format: "json" }));
        const json = JSON.parse(await res.text());

        const track = json[0];
        expect(Object.keys(track).sort()).toEqual([
            "addedAt",
            "artist",
            "genre",
            "notes",
            "purchased",
            "releaseDate",
            "releaseTitle",
            "releaseYear",
            "title",
        ]);
    });

    it("returns 500 on database error", async () => {
        mockQueryRaw.mockRejectedValue(new Error("DB error"));

        const res = await POST(makeRequest({ userId: "user-1" }));
        expect(res.status).toBe(500);
    });
});
