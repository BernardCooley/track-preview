import type { Track, ReviewTracks } from "../../types";

export const mockTrack: Track = {
    id: "track-1",
    title: "Test Track",
    artist: "Test Artist",
    genre: "Techno",
    releaseTitle: "Test Album",
    releaseYear: 2023,
    releaseDate: "2023-06-15",
    thumbnail: "https://example.com/thumb.jpg",
    purchaseUrl: "https://example.com/buy",
    platform: "spotify",
    platformId: "sp-123",
};

export const mockTrack2: Track = {
    id: "track-2",
    title: "Another Track",
    artist: "Another Artist",
    genre: "Deep House",
    releaseTitle: "Another Album",
    releaseYear: 2022,
    releaseDate: "2022-03-10",
    thumbnail: "https://example.com/thumb2.jpg",
    purchaseUrl: "https://example.com/buy2",
    platform: "spotify",
    platformId: "sp-456",
};

export const mockTrack3: Track = {
    id: "track-3",
    title: "Third Track",
    artist: "Third Artist",
    genre: "Ambient/Drone",
    releaseTitle: "Third Album",
    releaseYear: 2021,
    releaseDate: "2021-11-20",
    thumbnail: "https://example.com/thumb3.jpg",
    purchaseUrl: "https://example.com/buy3",
    platform: "spotify",
    platformId: "sp-789",
};

export const makeReviewTracks = (step4Tracks: Track[] = []): ReviewTracks => ({
    1: { tracks: [], currentTrack: 0 },
    2: { tracks: [], currentTrack: 0 },
    3: { tracks: [], currentTrack: 0 },
    4: { tracks: step4Tracks, currentTrack: 0 },
});
