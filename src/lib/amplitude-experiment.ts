import { Experiment, ExperimentClient } from "@amplitude/experiment-js-client";

let client: ExperimentClient | null = null;

export function getExperimentClient(): ExperimentClient | null {
    if (client) return client;

    const deploymentKey = process.env.NEXT_PUBLIC_AMPLITUDE_EXPERIMENT_DEPLOYMENT_KEY;
    if (!deploymentKey) return null;

    client = Experiment.initializeWithAmplitudeAnalytics(deploymentKey, {
        serverZone: "eu",
    });
    return client;
}
