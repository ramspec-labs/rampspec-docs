import { defineSecretProvider } from "<verified-runner-sdk-package>";

export const provider = defineSecretProvider({
  id: "controlled-test-credentials",
  version: "<adapter-version>",
  capabilities: ["secret-resolution"],
  async health(context) {
    return context.safeResult({ ready: await localProviderIsReady() });
  },
  async resolve(context, request) {
    context.policy.requireAllowedReference(request.reference);
    const value = await resolveLocally(request.reference, context.signal);
    return context.sensitive(value, { expiresAt: value.expiresAt });
  },
  async revoke(context, lease) {
    await revokeLocally(lease.recoveryRef, context.signal);
    return context.safeResult({ revoked: true });
  },
});

declare function localProviderIsReady(): Promise<boolean>;
declare function resolveLocally(
  reference: string,
  signal: AbortSignal,
): Promise<{
  bytes: Uint8Array;
  expiresAt: Date;
}>;
declare function revokeLocally(
  reference: string,
  signal: AbortSignal,
): Promise<void>;
