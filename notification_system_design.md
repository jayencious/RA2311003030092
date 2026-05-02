# Campus Notifications Microservice - Deliverables

## Stage 1: API Design
* **Endpoints:** Definition of `GET /notifications` to fetch the list of notifications and `PATCH /notifications/:id/read` to update the status.
* **Contract:** Use a JSON body with `ID`, `Type` (Placement, Event, Result), `Message` and `Timestamp`.
* **Real-time:** Suggestion: **Server-Sent Events (SSE)**. It is a memory-efficient method for uni-directional updates (Server -> Student) as compared to the overhead of WebSockets.

## Stage 2: Database Schema
* **Database Choice:** Suggestion: **PostgreSQL** with JSONB support. It is because it offers ACID compliance for important placement data while allowing flexible metadata storage.
* **Schema:** `id (UUID), student_id (INT), type (ENUM), message (TEXT), is_read (BOOL), created_at (TIMESTAMP)`.
* **Scalability:** As the volume grows, implement **Horizontal Partitioning (also known as Sharding)** based on the `student_id` ranges to distribute the load across multiple database instances.

## Stage 3: Query Optimization
* **Why it's slow:** The provided query is doing a "Sequential Scan", which means that is checks all the 5 million rows.
* **The Indexing Trap:** Indexing every column is bad because it creates a massive storage overhead and also slows down the `INSERT` operations, since the database needs to update every index tree for every new notification.
* **Optimization:** Creation of a **Composite Index** on `(studentID, isRead, createdAt DESC)`.
* **Query for last 7 days:** `SELECT * FROM notifications WHERE type = "Placement" AND createdAt >= NOW() - INTERVAL "7 days";`

## Stage 4: Performance (Caching enhances it and is the best solution to the problem)
* **Strategy:** Using **Redis** to store the "Unread Count" and the "Latest 20 Notifications" for every active student.
* **Tradeoff:** **Cache Consistency**. When a student marks a notification as read, we must update both the DB and the Redis cache simultaneously by using a Write-through pattern which avoids showing the stale data.

## Stage 5: Async Redesign
* **Problem:** The `for` loop is "Blocking". If it fails for one user (suppose #200), then the next use (#201) never gets their email. The HR user's browser will also timeout waiting for the 50,000 operations that don't get completed.
* **Redesign:** Using a queuing system (Message Queue) by utilizing RabbitMQ/Kafka.
    1. HR click "Notify All."
    2. Backend pushes 50,000 small "Task" messages into the queue.
    3. Backend immediately returns `202 Accepted` to the HR user.
    4. **Worker processes** pick up the tasks and send emails independently. If one fails, it goes to a **Dead Letter Queue (DLQ)** for retry without affecting the other emails that are to be sent.

## Stage 6: Prioritiy Inbox
- We need to create a file (e.g., `prioroti_index.ts`) that fetches the notifications and sorts them correctly.
- Algorithmic Logic:
    1. **Define Weights:** `Placement: 3, Result: 2, Event: 1`.
    2. **Sort Criteria:**
        * Primary: `Weight` (Highest first).
        * Secondary: `Timestamp` (Newest first).
- Code Implementation:

```ts
import {
    Log
} from "../logging_middleware";

const fetchNotifications = async (token: string) => {
    await Log("backend", "info", "repository", "Fetching notifications for priority sorting");

    const response = await fetch("http://20.207.122.201/evaluation-service/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    return await response.json();
};

const getPriorityInbox = (notifications: any[]) => {
    const weights: Record<string, number> = { "Placement": 3, "Result": 2, "Event": 1 };

    return notifications.sort((a, b) => {
        const weightA = weights[a.Type] || 0;
        const weightB = weights[b.Type] || 0;

        if (weightA !== weightB) {
            return weightB - weightA;
        }
        return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
    }).slice(0, 10);
};
```