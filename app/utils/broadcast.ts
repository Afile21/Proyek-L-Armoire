export function broadcastDataChange(action = "UNKNOWN") {
    try {
        const channel = new BroadcastChannel("catalog_channel");

        channel.postMessage({
            type: "DATA_CHANGED",
            action,
            timestamp: Date.now(),
        });

        channel.close();
    } catch (error) {
        console.error("Broadcast error:", error);
    }
}