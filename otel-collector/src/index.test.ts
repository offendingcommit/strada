import { describe, expect, it } from "vitest";
import { normalizeIngestRequest } from "./normalize-ingest-request.ts";

describe("Minilab ingest endpoint", () => {
  it("routes an OTLP request to the existing collector path", () => {
    const request = new Request("https://ingest.d6e.us/01kpvgtt9cjw4znef414vhgrfd/v1/traces", {
      method: "POST", body: "{}", headers: { "content-type": "application/json" },
    });
    const normalized = normalizeIngestRequest(request);
    expect(normalized?.method).toBe("POST");
    expect(normalized?.headers.get("content-type")).toBe("application/json");
    expect(new URL(normalized!.url).pathname).toBe("/v1/traces");
    expect(new URL(normalized!.url).searchParams.get("project_id")).toBe("01kpvgtt9cjw4znef414vhgrfd");
  });

  it("rejects paths without a ULID or a supported signal", () => {
    expect(normalizeIngestRequest(new Request("https://ingest.d6e.us/unknown/v1/traces"))).toBeNull();
    expect(normalizeIngestRequest(new Request("https://ingest.d6e.us/01kpvgtt9cjw4znef414vhgrfd/admin"))).toBeNull();
  });
});
