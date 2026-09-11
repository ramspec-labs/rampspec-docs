import {
  loadSchemaBundle,
  type ScenarioDocument,
} from "<verified-schema-helper-package>";

const schemas = loadSchemaBundle({
  expectedDigest: "<manifest-schema-bundle-digest>",
  allowRemoteReferences: false,
  coerceTypes: false,
  applyDefaults: false,
});

const input: unknown = await readUntrustedScenario("<scenario-path>");
const result = schemas.validate<ScenarioDocument>({
  schemaId: "<released-scenario-schema-id>",
  value: input,
});

if (!result.valid) {
  printSafeDiagnostics(result.errors);
  process.exitCode = 1;
} else {
  consumeValidatedScenario(result.value);
}

declare function readUntrustedScenario(path: string): Promise<unknown>;
declare function printSafeDiagnostics(errors: readonly unknown[]): void;
declare function consumeValidatedScenario(value: unknown): void;
