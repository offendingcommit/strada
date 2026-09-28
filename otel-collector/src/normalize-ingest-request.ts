export function normalizeIngestRequest(request: Request): Request | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/([0-9A-HJKMNP-TV-Z]{26})(\/v1\/(?:traces|logs|metrics))$/i);
  if (!match) return null;
  url.pathname = match[2]!;
  url.searchParams.set("project_id", match[1]!);
  return new Request(url, request);
}
