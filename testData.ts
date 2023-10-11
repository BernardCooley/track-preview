import { UserData } from "./types";

export const ReleaseIdsTestData = [
    6212253, 6315250, 5596856, 9223119, 8189645, 15213868, 11306947, 2839464,
    9107177, 10550952, 7260393, 1336656, 6051703, 17475418, 4159774, 4028850,
    8708038, 4978664, 1695570, 8703182, 2216022, 6271142, 14288026, 9111134,
    6353267, 9772933, 6135632, 1209729, 7105504, 5003617, 10442458, 4594123,
    2611982, 4638581, 5007014, 11098965, 3774740, 12215248, 4572511, 10797232,
    5809257, 1082968, 6965847, 3569467, 4241362, 2639163, 6225684, 14141759,
    7655847, 8259931,
];

export const SearchTrackTestData = {
    artist: "Milky chance",
    title: "Fairytale",
    releaseId: 2216022,
};

export const UserDataTestData: UserData = {
    preferredGenre: "Techno",
    tracks: [
        {
            genre: "Thrash",
            id: "3po5DUhb9R8KWr2P8lPvBf",
            furthestStep: 2,
            step: 0,
            title: "The Thing That Should Not Be",
            artist: "Metallica",
        },
    ],
};
