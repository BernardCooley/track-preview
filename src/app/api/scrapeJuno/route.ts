import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
const fs = require("fs");
import { v4 as uuidv4 } from "uuid";
import { SearchedTrack, StoredTrack } from "../../../../types";

export async function GET() {
    const getTracks = async () => {
        const browser = await puppeteer.launch({
            headless: true,
        });
        const page = await browser.newPage();
        const allTracks = [];

        const latestRelease = fs.readFileSync(
            "juno_scraped_tracks/latestRelease.txt",
            "utf-8"
        );

        for (let i = 1; i < 50; i++) {
            console.log(`getting page ${i} of 1142`);
            console.log(
                `https://www.juno.co.uk/all/back-cat/${i}/?media_type=vinyl&order=date_down`
            );
            await page.goto(
                `https://www.juno.co.uk/all/back-cat/${i}/?media_type=vinyl&order=date_down`
            );

            page.on("console", async (msg) => {
                const msgArgs = msg.args();
                for (let i = 0; i < msgArgs.length; ++i) {
                    console.log(await msgArgs[i].jsonValue());
                }
            });

            const pageTracks: any[] = await page.$$eval(".dv-item", (nodes) => {
                const monthMap = {
                    Jan: "01",
                    Feb: "02",
                    Mar: "03",
                    Apr: "04",
                    May: "05",
                    Jun: "06",
                    Jul: "07",
                    Aug: "08",
                    Sep: "09",
                    Oct: "10",
                    Nov: "11",
                    Dec: "12",
                };
                if (nodes && nodes !== undefined) {
                    try {
                        if (nodes && nodes !== undefined && nodes.length > 0) {
                            return nodes
                                .map((n) => {
                                    const purchaseUrl = n
                                        .querySelector("a[href]")
                                        ?.getAttribute("href");

                                    const trackDetailsSection =
                                        n.querySelector(".pl-info");

                                    const trackDetailsListElements =
                                        trackDetailsSection?.querySelectorAll(
                                            ".vi-text"
                                        );

                                    const trackDetailsListElementsArray =
                                        Array.from(trackDetailsListElements!);

                                    const artist =
                                        trackDetailsListElementsArray[0]
                                            .textContent;

                                    const releaseTitle =
                                        trackDetailsListElementsArray[1]
                                            .textContent;

                                    const releaseDate =
                                        trackDetailsListElementsArray[3]
                                            .textContent;

                                    const releaseDateSplit = releaseDate
                                        ?.replace(" Add to playlist", "")
                                        .substring(
                                            releaseDate.indexOf("Rel:") + 5
                                        )
                                        .split(" ");

                                    const releaseDateObject = {
                                        day: Number(releaseDateSplit![0]),
                                        month: Number(
                                            monthMap[
                                                releaseDateSplit![1] as keyof typeof monthMap
                                            ]
                                        ),
                                        year: Number(
                                            `20${releaseDateSplit![2]}`
                                        ),
                                    };

                                    const genre =
                                        trackDetailsListElementsArray[4]
                                            .textContent;

                                    const trackListContainer =
                                        n.querySelector(".vi-tracklist");

                                    const trackListElements =
                                        trackListContainer?.querySelectorAll(
                                            ".listing-track"
                                        );
                                    const trackListElementsArray = Array.from(
                                        trackListElements!
                                    );

                                    if (
                                        trackListElementsArray &&
                                        trackListElementsArray !== undefined &&
                                        trackListElementsArray.length > 0
                                    ) {
                                        return trackListElementsArray.map(
                                            (t) => {
                                                let fullString = t.textContent!;

                                                const indexFrom =
                                                    fullString.lastIndexOf("(");

                                                if (indexFrom !== -1) {
                                                    const toRemove =
                                                        fullString.substring(
                                                            indexFrom - 1,
                                                            fullString.length
                                                        );

                                                    fullString =
                                                        fullString.replace(
                                                            toRemove,
                                                            ""
                                                        );
                                                }

                                                const text = fullString
                                                    .replaceAll("\t", "")
                                                    .replaceAll("\n", "")
                                                    .replaceAll('"', "");

                                                if (
                                                    purchaseUrl &&
                                                    artist &&
                                                    releaseTitle &&
                                                    releaseDate &&
                                                    genre &&
                                                    text
                                                ) {
                                                    return {
                                                        platform: "juno",
                                                        purchaseUrl: `https://www.juno.co.uk${purchaseUrl}`,
                                                        artist,
                                                        releaseTitle:
                                                            releaseTitle?.replace(
                                                                / *\([^)]*\) */g,
                                                                ""
                                                            ),
                                                        genre,
                                                        title: text,
                                                        releaseDate:
                                                            releaseDateObject,
                                                        id: "",
                                                    };
                                                } else {
                                                    return {};
                                                }
                                            }
                                        );
                                    } else {
                                        return [];
                                    }
                                })
                                .flat();
                        } else {
                            return [];
                        }
                    } catch (error) {
                        return [];
                    }
                }
                return [];
            });

            var data = fs.readFileSync("juno_scraped_tracks/new.json");
            var myObject = JSON.parse(data);

            myObject.push(...pageTracks);

            const purchaseUrls = myObject.map((t: any) => t.purchaseUrl);

            const ind = purchaseUrls.indexOf(latestRelease);

            if (ind !== -1) {
                myObject.splice(ind, purchaseUrls.length);

                await browser.close();
                console.log("DONE");
            }

            if (myObject.length > 0) {
                const tracksWithIds = myObject.map((t: any) => {
                    return {
                        ...t,
                        id: uuidv4(),
                    };
                });

                fs.writeFileSync(
                    "juno_scraped_tracks/latestRelease.txt",
                    tracksWithIds[0].purchaseUrl,
                    (err: any) => {
                        if (err) console.log(err);
                    }
                );

                fs.writeFileSync(
                    "juno_scraped_tracks/new.json",
                    JSON.stringify(tracksWithIds, null, 4),
                    (err: any) => {
                        if (err) console.log(err);
                    }
                );
            }

            allTracks.push(...pageTracks);
        }
        await browser.close();
        console.log("DONE");
        return allTracks;
    };

    class GoneError extends Error {
        statusCode = 410;
    }
    class NotFoundError extends Error {
        statusCode = 404;
    }
    class BadRequestError extends Error {
        statusCode = 400;
    }
    class UnauthorisedError extends Error {
        statusCode = 401;
    }
    class InternalError extends Error {
        statusCode = 500;
    }

    const handleFetchErrors = (response: Response) => {
        switch (response.status) {
            case 401:
                throw new UnauthorisedError(response.statusText);
            case 400:
                throw new BadRequestError(response.statusText);
            case 404:
                throw new NotFoundError(response.statusText);
            case 410:
                throw new GoneError(response.statusText);
            default:
                null;
        }
    };

    const fetchWithErrorHandling = async <T>(
        endpoint: RequestInfo,
        method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
        body?: any
    ) => {
        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                return (await res.json()) as T;
            }
            handleFetchErrors(res);
        } catch (e) {
            throw e;
        }
        return null;
    };

    // let currentTrackIndex = 0;
    // const updatedTracks: StoredTrack[] = [];
    // let fileName = 2;
    // let notTouchedTracks: StoredTrack[] = [];
    // const foundTracks: StoredTrack[] = JSON.parse(
    //     await fs.readFileSync(
    //         `juno_scraped_tracks/found-tracks/${fileName}.json`
    //     )
    // );
    // let slicedNotTouchedTracks: StoredTrack[] = [];

    // const checkIfTrackExists = async () => {
    //     var data = await fs.readFileSync(
    //         `juno_scraped_tracks/stillToUpload/${fileName}.json`
    //     );

    //     const storedTracks: StoredTrack[] = JSON.parse(data);

    //     storedTracks.forEach((t) => {
    //         if (!foundTracks.map((t) => t.id).includes(t.id)) {
    //             notTouchedTracks.push(t);
    //         }
    //     });

    //     slicedNotTouchedTracks = notTouchedTracks.slice(0, 5000);

    //     console.log(
    //         "🚀 ~ file: route.ts:330 ~ interval ~ slicedNotTouchedTracks:",
    //         slicedNotTouchedTracks.length
    //     );

    //     interval;
    // };

    // const interval = setInterval(async () => {
    //     const artist = slicedNotTouchedTracks[currentTrackIndex].artist;
    //     const title = slicedNotTouchedTracks[currentTrackIndex].title;
    //     let platform = "deezer";
    //     // console.log(`${currentTrackIndex} of ${slicedNotTouchedTracks.length}`);
    //     let searchedTrack: SearchedTrack | null = null;
    //     let trackToSearch: string | null = `${artist} - ${title}`;

    //     const timeLeft = Math.round(
    //         ((slicedNotTouchedTracks.length - currentTrackIndex) * 0.2) / 60
    //     );
    //     // console.log("minutesLeft: ", timeLeft);

    //     try {
    //         searchedTrack = await fetchWithErrorHandling(
    //             "http://localhost:3000/api/getDeezerTrack",
    //             "POST",
    //             {
    //                 trackToSearch,
    //             }
    //         );

    //         if (!searchedTrack) {
    //             platform = "spotify";
    //             searchedTrack = await fetchWithErrorHandling(
    //                 "http://localhost:3000/api/getSpotifyTrack",
    //                 "POST",
    //                 {
    //                     trackToSearch: {
    //                         artist,
    //                         title,
    //                     },
    //                 }
    //             );
    //         }
    //     } catch (error) {
    //         console.log("Not found");
    //     }

    //     const storedTrack: StoredTrack = {
    //         ...slicedNotTouchedTracks[currentTrackIndex],
    //         found: tracksMatch(
    //             slicedNotTouchedTracks[currentTrackIndex],
    //             searchedTrack!
    //         )
    //             ? "yes"
    //             : "no",
    //         searchedTrack: searchedTrack ? searchedTrack : null,
    //     };

    //     if (!searchedTrack) {
    //         console.log("not found");
    //     }

    //     console.log(
    //         tracksMatch(
    //             slicedNotTouchedTracks[currentTrackIndex],
    //             searchedTrack!
    //         )
    //     );

    //     searchedTrack = null;
    //     trackToSearch = null;

    //     updatedTracks.push(storedTrack);

    //     currentTrackIndex++;

    //     if (currentTrackIndex === slicedNotTouchedTracks.length) {
    //         clearInterval(interval);

    //         const mergedTracks = [...foundTracks, ...updatedTracks];

    //         await fs.writeFile(
    //             `juno_scraped_tracks/found-tracks/${fileName}.json`,
    //             JSON.stringify(mergedTracks, null, 4),
    //             (err: any) => {
    //                 if (err) console.log(err);
    //             }
    //         );
    //     }
    // }, 200);

    // await checkIfTrackExists();

    const tracksMatch = (t1: StoredTrack, t2: SearchedTrack) => {
        return (
            t1.artist.toLowerCase().replaceAll(")", "").replaceAll("(", "") ===
            t2?.artist.toLowerCase().replaceAll(")", "").replaceAll("(", "")
        );
    };

    // const spotify = async () => {
    //     const tracks = await fetchWithErrorHandling(
    //         "http://localhost:3000/api/searchSpotify",
    //         "POST"
    //     );

    //     console.log("tracks: ", tracks);
    // };

    // await spotify();

    const util = async () => {
        for (let i = 1; i < 67; i++) {
            try {
                var data = await fs.readFileSync(
                    `juno_scraped_tracks/stillToUpload/${i}.json`
                );
                console.log(
                    "🚀 ~ file: route.ts:245 ~ util ~ `juno_scraped_tracks/stillToUpload/${i}.json`:",
                    `juno_scraped_tracks/stillToUpload/${i}.json`
                );
                const tracks = JSON.parse(data);
                console.log(
                    "🚀 ~ file: route.ts:246 ~ util ~ tracks:",
                    tracks.length
                );

                // const tracksWithUpdatedDates = tracks.map((t: any) => {
                //     return {
                //         ...t,
                //         releaseYear: new Date(t.releaseDate).getFullYear(),
                //     };
                // });

                // fs.writeFileSync(
                //     `juno_scraped_tracks/stillToUpload/withYear/${i}.json`,
                //     JSON.stringify(tracksWithUpdatedDates, null, 4),
                //     (err: any) => {
                //         if (err) console.log(err);
                //     }
                // );
            } catch (error) {}
        }
    };

    // await util();

    try {
        const tracks: any = [];
        // const tracks = await getTracks();

        if (tracks) {
            const response = NextResponse.json(tracks, {
                status: 200,
            });

            return response;
        } else {
            const response = NextResponse.json(null, {
                status: 200,
            });

            return response;
        }
    } catch (error: any) {
        console.error(error);

        return NextResponse.json(
            { error: error },
            {
                status: error.status || 500,
            }
        );
    }
}
