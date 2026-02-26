import * as Sentry from '@sentry/nextjs';

export async function register() {
  // ── OTel ──────────────────────────────────────────────────────────────────
  // @vercel/otel auto-instruments server components, route handlers, server
  // actions, and middleware.  It also propagates W3C traceparent headers on
  // server-side fetch() calls — e.g. dashboard → payment API — linking
  // the distributed trace end-to-end.
  //
  // Gated on OTEL_EXPORTER_OTLP_ENDPOINT: when unset (local dev) no traces
  // are exported and the SDK is effectively a no-op.
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const { registerOTel } = await import('@vercel/otel');
    registerOTel({
      serviceName: 'interchat-web',
    });
  }

  // ── Sentry ────────────────────────────────────────────────────────────────
  // Must be imported AFTER OTel so Sentry can piggyback on OTel's tracing
  // context via instrumenter: 'otel'.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
