/**
 * Server-side analytics for the InterChat dashboard.
 *
 * Sends structured business events to ClickHouse via its HTTP API,
 * using the same `interchat_analytics.activity_events` table and column
 * schema as the bot and payment services.
 *
 * Design:
 * - Non-blocking, fire-and-forget — a failed write never blocks the request
 * - No-op when CLICKHOUSE_URL is unset (local dev)
 * - All events are server-side only (never called from client components)
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('web.checkout_initiated', { userId: '...', tier: 'CORE' });
 */

import 'server-only';

// ── Config ──────────────────────────────────────────────────────────────────

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL ?? '';
const CLICKHOUSE_USER = process.env.CLICKHOUSE_USER ?? 'default';
const CLICKHOUSE_PASSWORD = process.env.CLICKHOUSE_PASSWORD ?? '';
const CLICKHOUSE_DB = process.env.CLICKHOUSE_ANALYTICS_DB ?? 'interchat_analytics';

const isActive = CLICKHOUSE_URL.length > 0;

// Precompute static endpoint URL and headers once at module init to avoid
// rebuilding them on every event call.
const activityEventsIngestUrl = (() => {
  if (!isActive) return '';
  const url = new URL(CLICKHOUSE_URL);
  url.searchParams.set('database', CLICKHOUSE_DB);
  url.searchParams.set('query', 'INSERT INTO activity_events FORMAT JSONEachRow');
  return url.toString();
})();

const clickhouseHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-ClickHouse-User': CLICKHOUSE_USER,
  'X-ClickHouse-Key': CLICKHOUSE_PASSWORD,
};

// ── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsEvent {
  /** Dot-namespaced event name, e.g. 'web.checkout_initiated' */
  eventName: string;
  userId?: string;
  guildId?: string;
  hubId?: string;
  properties?: Record<string, unknown>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build the JSONEachRow payload for a single event.
 * ClickHouse's HTTP API accepts `FORMAT JSONEachRow` bodies.
 */
function buildInsertBody(event: AnalyticsEvent): string {
  const row = {
    event_name: event.eventName,
    user_id: event.userId ?? '',
    guild_id: event.guildId ?? '',
    hub_id: event.hubId ?? '',
    timestamp: new Date().toISOString(),
    properties: JSON.stringify(event.properties ?? {}),
    bot_version: `web@${process.env.npm_package_version ?? '0.0.0'}`,
  };
  return JSON.stringify(row);
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Send a single analytics event to ClickHouse.
 *
 * This is non-blocking — it fires the HTTP request but does not `await` the
 * result in the calling code path.  Errors are silently swallowed (analytics
 * must never break the app).
 *
 * @param eventName Dot-namespaced event name, e.g. 'web.checkout_initiated'
 * @param opts Event properties (userId, guildId, hubId, properties)
 */
export function trackEvent(
  eventName: string,
  opts: Omit<AnalyticsEvent, 'eventName'> = {},
): void {
  if (!isActive) return;

  const event: AnalyticsEvent = { eventName, ...opts };
  const body = buildInsertBody(event);

  // Fire-and-forget — never block the request
  fetch(activityEventsIngestUrl, {
    method: 'POST',
    headers: clickhouseHeaders,
    body,
  })
    .then((response) => {
      if (!response.ok && process.env.NODE_ENV !== 'production') {
        console.warn(`[analytics] ClickHouse insert failed: ${response.status} ${response.statusText}`);
      }
    })
    .catch(() => {
      // Silently swallow — analytics should never break the app
    });
}

// ── Convenience helpers ─────────────────────────────────────────────────────

/** Premium checkout was initiated from the dashboard. */
export function trackCheckoutInitiated(userId: string, tier: string, priceId: string) {
  trackEvent('web.checkout_initiated', {
    userId,
    properties: { tier, price_id: priceId, source: 'dashboard' },
  });
}

/** User requested subscription cancellation from the dashboard. */
export function trackSubscriptionCancelRequested(userId: string) {
  trackEvent('web.subscription_cancel_requested', {
    userId,
  });
}

/** A server moderation action was taken (infraction revoked). */
export function trackInfractionRevoked(userId: string, infractionId: string) {
  trackEvent('web.infraction_revoked', {
    userId,
    properties: { infraction_id: infractionId },
  });
}

/** A server blocklist entry was added. */
export function trackServerBlocklistAdded(
  userId: string,
  serverId: string,
  opts: { blockedServerId?: string | null; blockedUserId?: string | null },
) {
  trackEvent('web.server_blocklist_added', {
    userId,
    properties: { server_id: serverId, ...opts },
  });
}

/** A server blocklist entry was removed. */
export function trackServerBlocklistRemoved(
  userId: string,
  serverId: string,
  blocklistId: string,
) {
  trackEvent('web.server_blocklist_removed', {
    userId,
    properties: { server_id: serverId, blocklist_id: blocklistId },
  });
}
