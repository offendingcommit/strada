// OTel collector — receives OTLP HTTP/JSON and forwards to Tinybird or ClickHouse.
//
// Config resolution: the collector shares a D1 binding with the website.
// On each request, it extracts the project ID from the URL path, queries D1
// for the project's database credentials, and creates the appropriate backend.
//
// Project isolation: project_id is the ULID from the `project` table.
// Each project gets an endpoint: ingest.d6e.us/{projectId}/v1/traces

import { env } from "cloudflare:workers";
import { createCollectorApp } from "./app.ts";
import { normalizeIngestRequest } from "./normalize-ingest-request.ts";

const app = createCollectorApp({ db: env.DB, anonymousRateLimiter: env.ANON_INGEST_RATE_LIMITER });

export default {
  fetch(request: Request): Promise<Response> {
    const normalized = normalizeIngestRequest(request);
    if (!normalized) return Promise.resolve(new Response("Not found", { status: 404 }));
    return app.handle(normalized);
  },
} satisfies ExportedHandler<Env>;

export { app };
