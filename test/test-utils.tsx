import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider, Theme } from "@chakra-ui/react";
import { system } from "../ChakraTheme";
import { AuthContext } from "../Contexts/AuthContext";
import { TrackContext } from "../context/TrackContext";
import { vi } from "vitest";
import type { User } from "../types";
import type { User as UserProfile } from "@prisma/client";
import type { TrackContextProps } from "./types";

const defaultAuthContext = {
    user: null as User | null,
    updateUser: vi.fn(),
    userProfile: null as UserProfile | null,
    updateUserProfile: vi.fn(),
    isAnonymous: false,
    setIsAnonymous: vi.fn(),
    profileError: false,
    setProfileError: vi.fn(),
};

const defaultTrackContext: TrackContextProps = {
    currentlyPlaying: undefined,
    updateCurrentlyPlaying: vi.fn(),
    onTrackEndedRef: { current: null },
    onSkipRef: { current: null },
    onPreviousRef: { current: null },
    playingPositionRef: { current: null },
    trackLoading: null,
    setTrackLoading: vi.fn(),
    reviewTracks: {
        1: { tracks: [], currentTrack: 0 },
        2: { tracks: [], currentTrack: 0 },
        3: { tracks: [], currentTrack: 0 },
        4: { tracks: [], currentTrack: 0 },
    },
    updateReviewTracks: vi.fn(),
    currentReleaseTrack: null,
    updateCurrentReleaseTrack: vi.fn(),
    previousTracks: [],
    updatePreviousTracks: vi.fn(),
    changesMade: { 2: true, 3: true, 4: true },
    updateChangesMade: vi.fn(),
};

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    authContext?: Partial<typeof defaultAuthContext>;
    trackContext?: Partial<typeof defaultTrackContext>;
}

function AllProviders({
    children,
    authContext = {},
    trackContext = {},
}: {
    children: React.ReactNode;
    authContext?: Partial<typeof defaultAuthContext>;
    trackContext?: Partial<typeof defaultTrackContext>;
}) {
    return (
        <ChakraProvider value={system}>
            <Theme appearance="light">
                <AuthContext.Provider value={{ ...defaultAuthContext, ...authContext }}>
                    <TrackContext.Provider value={{ ...defaultTrackContext, ...trackContext } as TrackContextProps}>
                        {children}
                    </TrackContext.Provider>
                </AuthContext.Provider>
            </Theme>
        </ChakraProvider>
    );
}

function customRender(
    ui: ReactElement,
    { authContext, trackContext, ...options }: CustomRenderOptions = {}
) {
    return render(ui, {
        wrapper: ({ children }) => (
            <AllProviders authContext={authContext} trackContext={trackContext}>
                {children}
            </AllProviders>
        ),
        ...options,
    });
}

export * from "@testing-library/react";
export { customRender as render };
