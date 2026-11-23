import { Experiment, RemoteEvaluationClient } from "@amplitude/experiment-node-server";

let client: RemoteEvaluationClient | null = null;

function getClient(): RemoteEvaluationClient | null {
    if (client) return client;

    const deploymentKey = process.env.AMPLITUDE_EXPERIMENT_SERVER_DEPLOYMENT_KEY;
    if (!deploymentKey) return null;

    client = Experiment.initializeRemote(deploymentKey, {
        serverZone: "eu",
    });
    return client;
}

export async function getServerFlag(flagKey: string, fallback = "off"): Promise<string> {
    const experimentClient = getClient();
    if (!experimentClient) return fallback;

    try {
        const variants = await experimentClient.fetch({ user_id: "server" });
        return variants[flagKey]?.value ?? fallback;
    } catch {
        return fallback;
    }
}
