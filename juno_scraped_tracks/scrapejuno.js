const puppeteer = require("puppeteer");
const fs = require("fs");
const v4 = require("uuid").v4;

const getTracks = async () => {
    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    const allTracks = [];

    for (let i = 1; i < 50; i++) {
        console.log(`getting page ${i}`);
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

        const pageTracks = await page.$$eval(".dv-item", (nodes) => {
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
                                    Array.from(trackDetailsListElements);

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
                                    .substring(releaseDate.indexOf("Rel:") + 5)
                                    .split(" ");

                                const releaseDateObject = {
                                    day: Number(releaseDateSplit[0]),
                                    month: Number(
                                        monthMap[releaseDateSplit[1]]
                                    ),

                                    year: Number(
                                        releaseDateSplit[2] > 50
                                            ? `19${releaseDateSplit[2]}`
                                            : `20${releaseDateSplit[2]}`
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
                                const trackListElementsArray =
                                    Array.from(trackListElements);

                                if (
                                    trackListElementsArray &&
                                    trackListElementsArray !== undefined &&
                                    trackListElementsArray.length > 0
                                ) {
                                    return trackListElementsArray.map((t) => {
                                        let fullString = t.textContent;

                                        const indexFrom =
                                            fullString.lastIndexOf("(");

                                        if (indexFrom !== -1) {
                                            const toRemove =
                                                fullString.substring(
                                                    indexFrom - 1,
                                                    fullString.length
                                                );

                                            fullString = fullString.replace(
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
                                                releaseDate: new Date(
                                                    Date.UTC(
                                                        releaseDateObject.year,
                                                        releaseDateObject.month -
                                                            1,
                                                        releaseDateObject.day
                                                    )
                                                ).toISOString(),
                                                releaseYear:
                                                    releaseDateObject.year,
                                                id: "",
                                            };
                                        } else {
                                            return {};
                                        }
                                    });
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

        if (myObject.length > 0) {
            const tracksWithIds = myObject.map((t) => {
                return {
                    ...t,
                    id: v4(),
                };
            });

            const d = new Date();

            fs.writeFileSync(
                `juno_scraped_tracks/new.json`,
                JSON.stringify(tracksWithIds, null, 4),
                (err) => {
                    if (err) console.log(err);
                }
            );
        }

        const purchaseUrls = myObject.map((t) => t.purchaseUrl);

        let ind = -1;
        const lastFoundReleasesRaw = fs.readFileSync(
            "juno_scraped_tracks/latestRelease.json"
        );
        const lastFoundReleases = JSON.parse(lastFoundReleasesRaw);

        for (release in lastFoundReleases) {
            ind = purchaseUrls.indexOf(lastFoundReleases[release]);

            if (ind !== -1) {
                myObject.splice(ind, purchaseUrls.length);
                const uniquePurchaseUrls = [...new Set(purchaseUrls)];

                fs.writeFileSync(
                    "juno_scraped_tracks/latestRelease.json",
                    JSON.stringify(
                        [
                            uniquePurchaseUrls[0],
                            uniquePurchaseUrls[1],
                            uniquePurchaseUrls[2],
                        ],
                        null,
                        4
                    ),
                    (err) => {
                        if (err) console.log(err);
                    }
                );

                await browser.close();
                console.log("DONE");

                break;
            }
        }

        allTracks.push(...pageTracks);
    }
    await browser.close();
    console.log("DONE");
};

getTracks();
