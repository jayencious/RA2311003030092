import { Log } from "../logging_middleware/Logging";

const AUTH_TOKEN = "YOUR_TOKEN_HERE";

async function runPriorityInbox() {
    try {
        // 1. Mandatory Logging
        await Log("backend", "info", "repository", "Fetching notifications for priority inbox");

        // 2. Fetch from API
        const response = await fetch("http://20.207.122.201/evaluation-service/notifications", {
            headers: { "Authorization": `Bearer ${AUTH_TOKEN}` }
        });

        if (!response.ok) throw new Error("Failed to fetch");
        
        const data = await response.json();
        const notifications = data.notifications;

        // 3. Priority Logic
        const weights: Record<string, number> = { 
            "Placement": 3, 
            "Result": 2, 
            "Event": 1 
        };

        const sorted = notifications.sort((a: any, b: any) => {
            const weightA = weights[a.Type] || 0;
            const weightB = weights[b.Type] || 0;

            if (weightA !== weightB) {
                return weightB - weightA; // Higher weight first
            }
            // Same weight? Newest timestamp first
            return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
        });

        // 4. Get Top 10
        const top10 = sorted.slice(0, 10);

        await Log("backend", "info", "handler", "Priority inbox calculated successfully");

        // 5. Output for Screenshot
        console.log("=== TOP 10 PRIORITY NOTIFICATIONS ===");
        console.table(top10); // Using console.table makes the screenshot look professional

    } catch (error) {
        console.error("Error:", error);
    }
}

runPriorityInbox();