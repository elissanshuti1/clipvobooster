// Simple in-memory store for generation progress (per user)
// In production, use Redis or similar

interface ProgressState {
  stage: string;
  postsFound: number;
  batchesAnalyzed: number;
  totalBatches: number;
  matchesFound: number;
  lastUpdate: number;
}

const progressStore = new Map<string, ProgressState>();

export function updateProgress(userId: string, progress: Partial<ProgressState>) {
  const current = progressStore.get(userId) || {
    stage: 'fetching',
    postsFound: 0,
    batchesAnalyzed: 0,
    totalBatches: 0,
    matchesFound: 0,
    lastUpdate: Date.now()
  };
  
  progressStore.set(userId, {
    ...current,
    ...progress,
    lastUpdate: Date.now()
  });
}

export function getProgress(userId: string): ProgressState | undefined {
  return progressStore.get(userId);
}

export function clearProgress(userId: string) {
  progressStore.delete(userId);
}

// Cleanup old entries after 5 minutes
setInterval(() => {
  const now = Date.now();
  progressStore.forEach((progress, userId) => {
    if (now - progress.lastUpdate > 300000) { // 5 minutes
      progressStore.delete(userId);
    }
  });
}, 60000); // Check every minute
