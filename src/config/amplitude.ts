const API_KEY = "2023a4fb86f0bfd9c6ffbb59f0f6c882";

const DEPLOYMENT_KEYS = {
    dev: "client-q0PJxM6vwG1jELWbE25Y4t3ezxLB8sKh",
    prod: "client-2d0b7LJZ53Pwj4tpOWjqpxgmtX1yECeo",
};

const FLAG_KEYS = {
    dev: "enable-subscriptions",
    prod: "enable-subscriptions-prod",
};

function getEnvironment(): "dev" | "prod" {
    if (typeof window === "undefined") return "dev";
    const hostname = window.location.hostname;
    if (hostname === "www.phoniquest.com" || hostname === "phoniquest.com") return "prod";
    return "dev";
}

export function getAmplitudeApiKey(): string {
    return API_KEY;
}

export function getExperimentDeploymentKey(): string {
    return DEPLOYMENT_KEYS[getEnvironment()];
}

export function getSubscriptionsFlagKey(): string {
    return FLAG_KEYS[getEnvironment()];
}
