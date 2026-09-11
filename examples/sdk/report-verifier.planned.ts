import { verifyReport } from "<verified-report-verifier-package>";

const result = await verifyReport({
  reportBytes: await readLocalBytes("<report-path>"),
  manifestBytes: await readLocalBytes("<release-manifest-path>"),
  suiteLockBytes: await readLocalBytes("<suite-lock-path>"),
  trustedKeySet: await readTrustedKeySet("<trusted-key-set-path>"),
  artifacts: await readArtifactInventory("<artifact-directory>"),
});

switch (result.kind) {
  case "verified":
    printVerifiedDigest(result.reportDigest, result.gate);
    break;
  case "invalid":
  case "untrusted-key":
  case "incompatible":
  case "cancelled":
    failClosed(result.kind);
}

declare function readLocalBytes(path: string): Promise<Uint8Array>;
declare function readTrustedKeySet(path: string): Promise<unknown>;
declare function readArtifactInventory(path: string): Promise<unknown>;
declare function printVerifiedDigest(digest: string, gate: string): void;
declare function failClosed(kind: string): never;
