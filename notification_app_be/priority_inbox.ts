import { Log } from "../logging_middleware/Logging";

const AUTH_TOKEN = process.env.TEST_SERVER_TOKEN;

async function runPriorityInbox() {
    try {
        await Log("backend", "info", "repository", "Fetching notifications for priority inbox");

        const response = await fetch("http://20.207.122.201/evaluation-service/notifications", {
            headers: { "Authorization": `Bearer ${AUTH_TOKEN}` }
        });

        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        const notifications = data.notifications;

        const weights: Record<string, number> = { 
            "Placement": 3, 
            "Result": 2, 
            "Event": 1 
        };

        const sorted = notifications.sort((a: any, b: any) => {
            const weightA = weights[a.Type] || 0;
            const weightB = weights[b.Type] || 0;

            if (weightA !== weightB) {
                return weightB - weightA;
            }
            return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
        });

        const top10 = sorted.slice(0, 10);

        await Log("backend", "info", "handler", "Priority inbox calculated successfully");

        console.log("=== TOP 10 PRIORITY NOTIFICATIONS ===");
        console.table(top10);

    } catch (error) {
        console.error("Error:", error);
    }
}

runPriorityInbox();