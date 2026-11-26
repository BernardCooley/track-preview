import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { ChakraProvider, Theme } from "@chakra-ui/react";
import { system } from "../../../ChakraTheme";
import { AuthContext } from "../../../Contexts/AuthContext";
import { TrackContext } from "../../../context/TrackContext";
import { useTrackReview } from "../useTrackReview";
import { mockTrack, mockTrack2 } from "../../../test/mocks/data";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/mocks/server";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import type { TrackContextProps } from "../../../test/types";
import type { User as UserProfile } from "@prisma/client";

vi.mock("../../../firebase/firebaseInit", () => ({
    auth: { currentUser: null },
    provider: {},
}));

const mockTrackEvent = vi.fn();
vi.mock("@amplitude/unified", () => ({
    track: (...args: any[]) => mockTrackEvent(...args),
    initAll: vi.fn(),
    setUserId: vi.fn(),
}));

const mockUpdateReviewTracks = vi.fn();
const mockUpdateChangesMade = vi.fn();

const defaultTrackContext: TrackContextProps = {
    currentlyPlaying: undefined,
    updateCurrentlyPlaying: vi.fn(),
    onTrackEndedRef: { current: null },
    onSkipRef: { current: null },
    onPreviousRef: { current: null },
    playingPositionRef: { current: null },
    trackLoading: null,
    setTrackLoading: vi.fn(),
    playingTrack: null,
    setPlayingTrack: vi.fn(),
    reviewTracks: {
        1: { tracks: [mockTrack, mockTrack2], currentTrack: 0 },
        2: { tracks: [], currentTrack: 0 },
        3: { tracks: [], currentTrack: 0 },
        4: { tracks: [], currentTrack: 0 },
    },
    updateReviewTracks: mockUpdateReviewTracks,
    currentReleaseTrack: null,
    updateCurrentReleaseTrack: vi.fn(),
    previousTracks: [],
    updatePreviousTracks: vi.fn(),
    changesMade: { 2: false, 3: false, 4: false },
    updateChangesMade: mockUpdateChangesMade,
};

const mockUserProfile = {
    id: "user-1",
    firebaseId: "user-1",
    autoplay: false,
    curatedMode: false,
    swipeMode: true,
    genres: ["all"],
    yearFrom: 1960,
    yearTo: 2026,
    lastActiveAt: new Date(),
} as UserProfile;

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider value={system}>
        <Theme appearance="light">
            <AuthContext.Provider
                value={{
                    user: { uid: "user-1", email: "test@test.com" },
                    updateUser: vi.fn(),
                    userProfile: mockUserProfile,
                    updateUserProfile: vi.fn(),
                    profileError: false,
                    setProfileError: vi.fn(),
                }}
            >
                <TrackContext.Provider value={defaultTrackContext as TrackContextProps}>
                    {children}
                </TrackContext.Provider>
            </AuthContext.Provider>
        </Theme>
    </ChakraProvider>
);

describe("useTrackReview analytics events", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        server.use(
            http.post("/api/updateTrackReviewStep", () => {
                return HttpResponse.json([]);
            }),
            http.post("/api/getTracks", () => {
                return HttpResponse.json([]);
            }),
            http.post("/api/resolvePreviewUrl", () => {
                return HttpResponse.json({ previewUrl: "" });
            }),
            http.post("/api/mutateUserProfile", async ({ request }) => {
                const body = await request.json();
                return HttpResponse.json(body);
            })
        );
    });

    it("fires 'Track Liked' with enriched properties on like", async () => {
        const { result } = renderHook(() => useTrackReview(1), { wrapper });

        await act(async () => {
            await result.current.likeOrDislike(true);
        });

        await waitFor(() => {
            expect(mockTrackEvent).toHaveBeenCalledWith("Track Liked", expect.objectContaining({
                trackId: mockTrack.id,
                artist: mockTrack.artist,
                title: mockTrack.title,
                genre: mockTrack.genre,
                releaseYear: mockTrack.releaseYear,
                reviewStep: 1,
                listened: false,
            }));
        });
    });

    it("fires 'Track Disliked' with enriched properties on dislike", async () => {
        const { result } = renderHook(() => useTrackReview(1), { wrapper });

        await act(async () => {
            await result.current.likeOrDislike(false);
        });

        await waitFor(() => {
            expect(mockTrackEvent).toHaveBeenCalledWith("Track Disliked", expect.objectContaining({
                trackId: mockTrack.id,
                artist: mockTrack.artist,
                title: mockTrack.title,
                genre: mockTrack.genre,
                releaseYear: mockTrack.releaseYear,
                reviewStep: 1,
            }));
        });
    });

    it("fires 'Filter Applied' with genre details on genre change", async () => {
        const { result } = renderHook(() => useTrackReview(1), { wrapper });

        await act(async () => {
            await result.current.onGenreApply(["Techno", "House"]);
        });

        await waitFor(() => {
            expect(mockTrackEvent).toHaveBeenCalledWith("Filter Applied", {
                filterType: "genre",
                genres: ["Techno", "House"],
                genreCount: 2,
            });
        });
    });

    it("does not fire 'Filter Applied' when genres unchanged", async () => {
        const { result } = renderHook(() => useTrackReview(1), { wrapper });

        await act(async () => {
            await result.current.onGenreApply(["all"]);
        });

        expect(mockTrackEvent).not.toHaveBeenCalledWith("Filter Applied", expect.anything());
    });

    it("fires 'Filter Applied' with year details on year change", async () => {
        const { result } = renderHook(() => useTrackReview(1), { wrapper });

        await act(async () => {
            await result.current.onYearConfirm({ from: 1980, to: 2000 });
        });

        await waitFor(() => {
            expect(mockTrackEvent).toHaveBeenCalledWith("Filter Applied", {
                filterType: "year",
                yearFrom: 1980,
                yearTo: 2000,
            });
        });
    });

    it("does not fire analytics when no user is logged in", async () => {
        const noUserWrapper = ({ children }: { children: React.ReactNode }) => (
            <ChakraProvider value={system}>
                <Theme appearance="light">
                    <AuthContext.Provider
                        value={{
                            user: null,
                            updateUser: vi.fn(),
                            userProfile: null,
                            updateUserProfile: vi.fn(),
                            profileError: false,
                            setProfileError: vi.fn(),
                        }}
                    >
                        <TrackContext.Provider value={defaultTrackContext as TrackContextProps}>
                            {children}
                        </TrackContext.Provider>
                    </AuthContext.Provider>
                </Theme>
            </ChakraProvider>
        );

        const { result } = renderHook(() => useTrackReview(1), { wrapper: noUserWrapper });

        await act(async () => {
            await result.current.likeOrDislike(true);
        });

        expect(mockTrackEvent).not.toHaveBeenCalled();
    });
});
