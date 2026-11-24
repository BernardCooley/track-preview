import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import React from "react";
import { ChakraProvider, Theme } from "@chakra-ui/react";
import { system } from "../../../ChakraTheme";
import { AuthContext } from "../../../Contexts/AuthContext";
import { TrackContext } from "../../../context/TrackContext";
import { useTrackList } from "../useTrackList";
import { mockTrack, mockTrack2, mockTrack3 } from "../../../test/mocks/data";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/mocks/server";
import "../../../test/mocks/firebase";
import "../../../test/mocks/navigation";
import type { TrackContextProps } from "../../../test/types";
import type { User as UserProfile } from "@prisma/client";

const mockUpdateReviewTracks = vi.fn();
const mockUpdateCurrentlyPlaying = vi.fn();
const mockUpdateChangesMade = vi.fn();
const mockSetPlayingTrack = vi.fn();

const defaultTrackContext: TrackContextProps = {
    currentlyPlaying: undefined,
    updateCurrentlyPlaying: mockUpdateCurrentlyPlaying,
    onTrackEndedRef: { current: null },
    onSkipRef: { current: null },
    onPreviousRef: { current: null },
    playingPositionRef: { current: null },
    trackLoading: null,
    setTrackLoading: vi.fn(),
    playingTrack: null,
    setPlayingTrack: mockSetPlayingTrack,
    reviewTracks: {
        1: { tracks: [], currentTrack: 0 },
        2: { tracks: [], currentTrack: 0 },
        3: { tracks: [], currentTrack: 0 },
        4: { tracks: [mockTrack, mockTrack2, mockTrack3], currentTrack: 0 },
    },
    updateReviewTracks: mockUpdateReviewTracks,
    currentReleaseTrack: null,
    updateCurrentReleaseTrack: vi.fn(),
    previousTracks: [],
    updatePreviousTracks: vi.fn(),
    changesMade: { 2: true, 3: true, 4: true },
    updateChangesMade: mockUpdateChangesMade,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider value={system}>
        <Theme appearance="light">
            <AuthContext.Provider
                value={{
                    user: { uid: "user-1", email: "test@test.com" },
                    updateUser: vi.fn(),
                    userProfile: null,
                    updateUserProfile: vi.fn(),
                    isAnonymous: false,
                    setIsAnonymous: vi.fn(),
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

describe("useTrackList", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initializes with default sort state", () => {
        const { result } = renderHook(() => useTrackList(), { wrapper });
        expect(result.current.sortBy).toBe("title");
        expect(result.current.sortDirection).toBe("desc");
    });

    it("initializes with loading false", () => {
        const { result } = renderHook(() => useTrackList(), { wrapper });
        expect(result.current.loading).toBe(false);
    });

    it("sets trackToDelete", () => {
        const { result } = renderHook(() => useTrackList(), { wrapper });
        act(() => {
            result.current.setTrackToDelete(1);
        });
        expect(result.current.trackToDelete).toBe(1);
    });

    it("sets trackToBuy", () => {
        const { result } = renderHook(() => useTrackList(), { wrapper });
        act(() => {
            result.current.setTrackToBuy(0);
        });
        expect(result.current.trackToBuy).toBe(0);
    });

    it("closeDialog resets trackToDelete to null", () => {
        const { result } = renderHook(() => useTrackList(), { wrapper });
        act(() => {
            result.current.setTrackToDelete(2);
        });
        act(() => {
            result.current.closeDialog();
        });
        expect(result.current.trackToDelete).toBeNull();
    });

    it("closeBuyModal resets trackToBuy to null", () => {
        const { result } = renderHook(() => useTrackList(), { wrapper });
        act(() => {
            result.current.setTrackToBuy(1);
        });
        act(() => {
            result.current.closeBuyModal();
        });
        expect(result.current.trackToBuy).toBeNull();
    });

    it("getTracks fetches library tracks", async () => {
        const libraryTracks = [
            { ...mockTrack, id: "lib-1" },
            { ...mockTrack2, id: "lib-2" },
        ];
        server.use(
            http.post("/api/getTracks", () => {
                return HttpResponse.json(libraryTracks);
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        await act(async () => {
            await result.current.getTracks(null);
        });

        await waitFor(() => {
            expect(mockUpdateReviewTracks).toHaveBeenCalledWith(
                4,
                libraryTracks,
                0
            );
        });
    });

    it("getTracks sets noTracks when empty result", async () => {
        server.use(
            http.post("/api/getTracks", () => {
                return HttpResponse.json([]);
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        await act(async () => {
            await result.current.getTracks(null);
        });

        await waitFor(() => {
            expect(result.current.noTracks).toBe(true);
        });
    });

    it("getTracks fetches release tracks when track is provided", async () => {
        const releaseTracks = [{ ...mockTrack, id: "rel-1" }];
        server.use(
            http.post("/api/getRelease", () => {
                return HttpResponse.json(releaseTracks);
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        await act(async () => {
            await result.current.getTracks(mockTrack);
        });

        await waitFor(() => {
            expect(mockUpdateReviewTracks).toHaveBeenCalledWith(
                4,
                releaseTracks,
                0
            );
        });
    });

    it("deleteTrack calls updateTrackReviewStep API and clears player", async () => {
        let apiCalled = false;
        server.use(
            http.post("/api/updateTrackReviewStep", () => {
                apiCalled = true;
                return HttpResponse.json([]);
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        act(() => {
            result.current.setTrackToDelete(0);
        });

        await act(async () => {
            await result.current.deleteTrack();
        });

        await waitFor(() => {
            expect(apiCalled).toBe(true);
            expect(mockUpdateCurrentlyPlaying).toHaveBeenCalledWith(undefined);
            expect(mockSetPlayingTrack).toHaveBeenCalledWith(null);
        });
    });

    it("addTrackToLibrary calls sendToLibrary API and updates libraryTrackIds", async () => {
        let apiBody: any = null;
        server.use(
            http.post("/api/sendToLibrary", async ({ request }) => {
                apiBody = await request.json();
                return HttpResponse.json({ success: true });
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        await act(async () => {
            await result.current.addTrackToLibrary(mockTrack2);
        });

        await waitFor(() => {
            expect(apiBody).toEqual({ trackId: "track-2", userId: "user-1" });
            expect(result.current.libraryTrackIds.has("track-2")).toBe(true);
        });
    });

    it("addTrackToLibrary flags changesMade for step 4", async () => {
        server.use(
            http.post("/api/sendToLibrary", () => {
                return HttpResponse.json({ success: true });
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        await act(async () => {
            await result.current.addTrackToLibrary(mockTrack);
        });

        await waitFor(() => {
            expect(mockUpdateChangesMade).toHaveBeenCalledWith(4, true);
        });
    });

    it("addTrackToLibrary clears addingTrackId after completion", async () => {
        server.use(
            http.post("/api/sendToLibrary", () => {
                return HttpResponse.json({ success: true });
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        await act(async () => {
            await result.current.addTrackToLibrary(mockTrack);
        });

        await waitFor(() => {
            expect(result.current.addingTrackId).toBeNull();
        });
    });

    it("addTrackToLibrary clears addingTrackId on failure", async () => {
        server.use(
            http.post("/api/sendToLibrary", () => {
                return HttpResponse.error();
            })
        );

        const { result } = renderHook(() => useTrackList(), { wrapper });

        await act(async () => {
            await result.current.addTrackToLibrary(mockTrack);
        });

        await waitFor(() => {
            expect(result.current.addingTrackId).toBeNull();
            expect(result.current.libraryTrackIds.has("track-1")).toBe(false);
        });
    });

    describe("toggleTrackPurchased", () => {
        it("optimistically updates track to purchased and calls API", async () => {
            let apiBody: any = null;
            server.use(
                http.post("/api/togglePurchased", async ({ request }) => {
                    apiBody = await request.json();
                    return HttpResponse.json({ success: true });
                })
            );

            const { result } = renderHook(() => useTrackList(), { wrapper });

            await act(async () => {
                await result.current.toggleTrackPurchased(0);
            });

            await waitFor(() => {
                expect(apiBody).toEqual({
                    trackId: "track-1",
                    userId: "user-1",
                    purchased: true,
                });
                expect(mockUpdateReviewTracks).toHaveBeenCalledWith(
                    4,
                    expect.arrayContaining([
                        expect.objectContaining({ id: "track-1", purchased: true }),
                    ]),
                    0
                );
            });
        });

        it("toggles purchased back to false for already purchased track", async () => {
            const purchasedTrack = { ...mockTrack, purchased: true };
            const customTrackContext = {
                ...defaultTrackContext,
                reviewTracks: {
                    ...defaultTrackContext.reviewTracks,
                    4: { tracks: [purchasedTrack, mockTrack2, mockTrack3], currentTrack: 0 },
                },
            };

            const customWrapper = ({ children }: { children: React.ReactNode }) => (
                <ChakraProvider value={system}>
                    <Theme appearance="light">
                        <AuthContext.Provider
                            value={{
                                user: { uid: "user-1", email: "test@test.com" },
                                updateUser: vi.fn(),
                                userProfile: null,
                                updateUserProfile: vi.fn(),
                                isAnonymous: false,
                                setIsAnonymous: vi.fn(),
                                profileError: false,
                                setProfileError: vi.fn(),
                            }}
                        >
                            <TrackContext.Provider value={customTrackContext as TrackContextProps}>
                                {children}
                            </TrackContext.Provider>
                        </AuthContext.Provider>
                    </Theme>
                </ChakraProvider>
            );

            let apiBody: any = null;
            server.use(
                http.post("/api/togglePurchased", async ({ request }) => {
                    apiBody = await request.json();
                    return HttpResponse.json({ success: true });
                })
            );

            const { result } = renderHook(() => useTrackList(), { wrapper: customWrapper });

            await act(async () => {
                await result.current.toggleTrackPurchased(0);
            });

            await waitFor(() => {
                expect(apiBody).toEqual({
                    trackId: "track-1",
                    userId: "user-1",
                    purchased: false,
                });
            });
        });

        it("only updates the targeted track, leaving others unchanged", async () => {
            server.use(
                http.post("/api/togglePurchased", () => {
                    return HttpResponse.json({ success: true });
                })
            );

            const { result } = renderHook(() => useTrackList(), { wrapper });

            await act(async () => {
                await result.current.toggleTrackPurchased(1);
            });

            await waitFor(() => {
                const call = mockUpdateReviewTracks.mock.calls[0];
                const updatedTracks = call[1];
                expect(updatedTracks[0].id).toBe("track-1");
                expect(updatedTracks[0].purchased).toBeFalsy();
                expect(updatedTracks[1]).toEqual(expect.objectContaining({ id: "track-2", purchased: true }));
                expect(updatedTracks[2].id).toBe("track-3");
                expect(updatedTracks[2].purchased).toBeFalsy();
            });
        });

        it("reverts on API failure", async () => {
            server.use(
                http.post("/api/togglePurchased", () => {
                    return HttpResponse.error();
                })
            );

            const { result } = renderHook(() => useTrackList(), { wrapper });

            await act(async () => {
                await result.current.toggleTrackPurchased(0);
            });

            await waitFor(() => {
                expect(mockUpdateReviewTracks).toHaveBeenCalledTimes(2);
                const revertCall = mockUpdateReviewTracks.mock.calls[1];
                const revertedTracks = revertCall[1];
                expect(revertedTracks[0]).toEqual(expect.objectContaining({ id: "track-1", purchased: false }));
            });
        });

        it("does nothing when user is not logged in", async () => {
            const noUserWrapper = ({ children }: { children: React.ReactNode }) => (
                <ChakraProvider value={system}>
                    <Theme appearance="light">
                        <AuthContext.Provider
                            value={{
                                user: null,
                                updateUser: vi.fn(),
                                userProfile: null,
                                updateUserProfile: vi.fn(),
                                isAnonymous: false,
                                setIsAnonymous: vi.fn(),
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

            const { result } = renderHook(() => useTrackList(), { wrapper: noUserWrapper });

            await act(async () => {
                await result.current.toggleTrackPurchased(0);
            });

            expect(mockUpdateReviewTracks).not.toHaveBeenCalled();
        });
    });
});
