/**
 * AsyncQueueManager
 * 
 * Provides a mechanism to handle high-frequency asynchronous requests (like rapid clicking)
 * by ensuring they are processed sequentially, while always prioritizing the latest intended state.
 */

export class AsyncQueueManager<T> {
    private queues = new Map<string, { inProgress: boolean; lastParam: T | null }>();

    /**
     * Enqueues an action for a specific ID.
     * If an action for this ID is already in progress, the new parameter is buffered.
     * Only the latest buffered parameter will be processed after the current action completes.
     */
    async enqueue(id: string, param: T, action: (p: T) => Promise<void>) {
        const state = this.queues.get(id) || { inProgress: false, lastParam: null };

        if (state.inProgress) {
            // Buffer the latest state to sync
            state.lastParam = param;
            this.queues.set(id, state);
            return;
        }

        // Mark as in progress
        state.inProgress = true;
        this.queues.set(id, state);

        const run = async (p: T) => {
            try {
                await action(p);
            } finally {
                const s = this.queues.get(id);
                if (s && s.lastParam !== null) {
                    const next = s.lastParam;
                    s.lastParam = null; // Clear the buffer
                    await run(next); // Process the latest buffered state
                } else {
                    this.queues.delete(id);
                }
            }
        };

        await run(param);
    }
}
