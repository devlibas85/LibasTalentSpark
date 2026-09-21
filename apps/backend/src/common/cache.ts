import NodeCache from "node-cache";

// TTL: 5 minutes — short enough that a deactivated user is locked out within 5 min
// without needing a Redis blacklist. Each requireAuth hit skips a full DB round-trip.
export const userCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export function getCachedUser(userId: string) {
  return userCache.get<Record<string, unknown>>(userId) ?? null;
}

export function setCachedUser(userId: string, user: Record<string, unknown>) {
  userCache.set(userId, user);
}

export function invalidateCachedUser(userId: string) {
  userCache.del(userId);
}
