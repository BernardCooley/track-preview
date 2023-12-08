-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firebaseId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchedTrack" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "previewUrl" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "SearchedTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "furthestReviewStep" INTEGER NOT NULL,
    "currentReviewStep" INTEGER NOT NULL,
    "genre" TEXT NOT NULL,
    "searchedTrackId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purchaseUrl" TEXT NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoredTrack" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "purchaseUrl" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "releaseTitle" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,

    CONSTRAINT "StoredTrack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_searchedTrackId_fkey" FOREIGN KEY ("searchedTrackId") REFERENCES "SearchedTrack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
