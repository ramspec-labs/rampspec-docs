# RampSpec Documentation

RampSpec is a continuous SEP conformance and anchor interoperability lab for Stellar. This repository owns its product, protocol, API, contract, operator, security, contributor, and governance documentation.

RampSpec produces conformance results, evidence reports, and verified runs. It is not an official Stellar Development Foundation certification service, a security audit, legal advice, or regulatory approval.

## Repository status

The documentation is under active construction. Pages distinguish planned behavior, local fixture validation, testnet deployment, pubnet deployment, external review, and adoption. A statement is not treated as deployment evidence without a release manifest or verification record.

## Repository boundary

- `rampspec-docs` owns authored guides, documentation navigation, generated-reference import tooling, and versioned documentation releases.
- `rampspec-backend` owns OpenAPI, JSON Schemas, protocol rules, scenarios, reports, CLI behavior, and backend SDK sources.
- `rampspec-contracts` owns contract specifications, bindings, WASM hashes, and deployment manifests.
- `rampspec-frontend` owns application behavior and UI implementation.

Generated runtime interfaces are imported from tagged releases. Do not manually redefine them here.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow, [SECURITY.md](SECURITY.md) for private vulnerability reporting, and [governance/docs-release-policy.mdx](governance/docs-release-policy.mdx) for documentation release rules.

The local documentation toolchain is introduced in the next implementation unit. Until then, review Markdown structure and run `git diff --check` before opening a pull request.

## License

Licensed under the [Apache License 2.0](LICENSE).
