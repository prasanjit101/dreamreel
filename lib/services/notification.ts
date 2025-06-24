import { env } from "@/env";

export async function sendAdminSlackNotification(message: string): Promise<void> {
    try {
        const payload = {
            text: message,
        };

        if (!env.SLACK_NOTIFICATION_URL) {
            console.warn("SLACK_NOTIFICATION_URL is not set. Skipping notification.");
            return;
        }

        const response = await fetch(env.SLACK_NOTIFICATION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
    
        if (!response.ok) {
            throw new Error(`Slack notification failed: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error sending Slack notification:", error);
    }
}