import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, afterAll, beforeAll } from "vitest";
import { server } from "./mocks/server";

afterEach(() => {
    cleanup();
});

beforeAll(() => server.listen({ onUnhandledFrame: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
