export async function notifyDiscord(message: string) {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) return;

    try {
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: message }),
        });
    } catch (error) {
        console.error("Discord notification failed:", error);
    }
}
