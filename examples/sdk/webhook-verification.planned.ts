import { createWebhookVerifier } from "<verified-webhook-package>";

const verifier = createWebhookVerifier({
  recipient: "<configured-recipient-id>",
  keyProvider: localKeyProvider,
  replayStore: durableReplayStore,
  toleranceSeconds: 120,
});

const rawBody = await readBoundedRawBody(request, 256_000);
const decision = await verifier.verify({
  headers: request.headers,
  rawBody,
  receivedAt: new Date(),
});

if (decision.kind !== "verified") {
  return safeFailureResponse(decision.kind);
}

await durableEventQueue.put(decision.eventId, decision.event);
return new Response(null, { status: 204 });

declare const request: Request;
declare const localKeyProvider: unknown;
declare const durableReplayStore: unknown;
declare const durableEventQueue: {
  put(id: string, value: unknown): Promise<void>;
};
declare function readBoundedRawBody(
  request: Request,
  limit: number,
): Promise<Uint8Array>;
declare function safeFailureResponse(kind: string): Response;
