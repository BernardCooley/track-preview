"use client";
import {
    cleanSeedData,
    deleteStoredTrack,
    fetchDeezerTrack,
    fetchITunesTrack,
    fetchSpotifyTrack,
    restoreDatabase,
} from "@/bff/bff";
import Header from "@/components/Header";
import { Box } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { SearchedTrack, Track } from "../../../types";
import storedTracks from "../../../scraping_tracks/seed/3.json";

interface Props {}

const Settings = ({}: Props) => {
    const trackNumber = storedTracks.length;
    const [tracks, setTracks] = useState<Track[]>(storedTracks as Track[]);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [notFoundTracks, setNotFoundTracks] = useState<Track[]>([]);

    useEffect(() => {
        (async () => {
            // await cleanSeedData();
        })();
    }, []);

    // useEffect(() => {
    //     if (tracks.length > 0) {
    //         setCurrentTrack(tracks[0]);
    //     } else {
    //         console.log(notFoundTracks);
    //     }
    // }, [tracks]);

    // useEffect(() => {
    //     if (currentTrack) {
    //         searchForTrack(currentTrack);
    //     }
    // }, [currentTrack]);

    const searchForTrack = async (track: Track): Promise<Track | null> => {
        let searchedTrack: SearchedTrack | null = null;

        console.log(trackNumber - tracks.length + 1, " of ", trackNumber);

        try {
            searchedTrack = await fetchDeezerTrack({
                trackToSearch: `${track.artist} - ${track.title}`,
                releaseYear: track.releaseYear,
            });
        } catch (error: any) {}

        // if (!searchedTrack) {
        //     try {
        //         searchedTrack = await fetchSpotifyTrack({
        //             trackToSearch: {
        //                 artist: track.artist,
        //                 title: track.title,
        //             },
        //             releaseYear: track.releaseYear,
        //         });
        //         notFound = false;
        //     } catch (error: any) {
        //         if (error.statusCode === 404) {
        //             notFound = true;
        //         }
        //     }
        // }

        // if (!searchedTrack) {
        //     try {
        //         searchedTrack = await fetchITunesTrack({
        //             trackToSearch: `${track.artist} - ${track.title}`,
        //             releaseYear: track.releaseYear,
        //         });
        //         notFound = false;
        //     } catch (error: any) {
        //         if (error.statusCode === 404) {
        //             notFound = true;
        //         }
        //     }
        // }

        if (searchedTrack) {
            searchedTrack.id = searchedTrack.id.toString();

            setTracks((prev) => {
                const newTracks = [...prev];
                newTracks.shift();
                return newTracks;
            });

            return {
                ...searchedTrack,
                ...track,
            };
        }

        setTracks((prev) => {
            const newTracks = [...prev];
            newTracks.shift();
            return newTracks;
        });

        setNotFoundTracks((prev) => [...prev, track]);

        return null;
    };

    return (
        <Box h="full" m={0} px={[4, 8]}>
            <Header />
        </Box>
    );
};

export default Settings;
