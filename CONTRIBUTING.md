# Contributing to RampSpec Documentation

Thank you for improving RampSpec. Documentation changes are product changes: they must be technically accurate, safe to execute, and traceable to the repository that owns the behavior.

## Before starting

1. Read the issue and confirm this repository owns the requested outcome.
2. Link the authoritative API, schema, contract, SEP snapshot, release, or decision record.
3. State whether examples are planned, fixture-validated, locally checked, testnet deployed, or pubnet deployed.
4. Never add credentials, private endpoints, customer data, real identity documents, or unrestricted signing instructions.

## Authoring rules

- Give every MDX page `title` and `description` frontmatter.
- Open with a direct definition of the page subject.
- Use focused sections and exact examples.
- Put executable commands and configuration in `examples/` and validate them in CI.
- Link normative claims to a pinned upstream source when available.
- Use `conformance result`, `evidence report`, and `verified run`; do not imply certification or legal approval.
- Update `docs.json` when adding, moving, or deleting a page.
- Do not manually edit generated files under `generated/`.

## Pull requests

Keep one independently reviewable outcome per pull request. Complete the pull request template, include the validation commands and results, identify cross-repository dependencies, and link the issue with `Closes #<number>` when applicable.

Maintainers may request protocol, security, accessibility, legal-language, or owning-repository review. All required checks and reviews must pass before merge.

## License agreement

By contributing, you agree that your contribution is licensed under Apache-2.0 and that you have the right to submit it. RampSpec currently uses this inbound-equals-outbound model and does not require a separate contributor license agreement.
