import { createReadOnlyEvidenceClient } from "<verified-contract-bindings-package>";

const manifest = await readVerifiedDeploymentManifest(
  "<deployment-manifest-path>",
);
const client = createReadOnlyEvidenceClient({ manifest });

const integrity = await client.verifyDeploymentIntegrity();
if (!integrity.verified) {
  failClosed(integrity.reason);
}

const result = await client.lookupByReportDigest("<canonical-report-sha256>", {
  ledger: "latest-verified",
});

if (result.kind === "verified") displayCommitment(result.commitment);
else handleUnverifiedOrAbsent(result);

declare function readVerifiedDeploymentManifest(path: string): Promise<unknown>;
declare function failClosed(reason: string): never;
declare function displayCommitment(value: unknown): void;
declare function handleUnverifiedOrAbsent(value: unknown): void;
