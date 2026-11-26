import { Experiment, ExperimentClient } from "@amplitude/experiment-js-client";
import { getExperimentDeploymentKey } from "@/config/amplitude";

let client: ExperimentClient | null = null;

export function getExperimentClient(): ExperimentClient {
    if (client) return client;

    client = Experiment.initialize(getExperimentDeploymentKey(), {
        serverZone: "eu",
    });
    return client;
}
