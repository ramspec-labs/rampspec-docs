import { createClient } from "<verified-api-client-package>";

const client = createClient({
  baseUrl: process.env.RAMPSPEC_API_ORIGIN,
  tokenProvider: async ({ scopes, signal }) =>
    obtainScopedToken({ scopes, signal }),
});

const controller = new AbortController();
const deadline = setTimeout(() => controller.abort(), 30_000);

try {
  let cursor: string | undefined;
  do {
    const result = await client.runs.list({
      cursor,
      limit: 50,
      signal: controller.signal,
    });
    if (!result.ok) throw result.error;
    consumeRuns(result.value.items);
    cursor = result.value.nextCursor;
  } while (cursor);
} finally {
  clearTimeout(deadline);
}

declare function obtainScopedToken(input: {
  scopes: readonly string[];
  signal: AbortSignal;
}): Promise<string>;
declare function consumeRuns(items: readonly unknown[]): void;
