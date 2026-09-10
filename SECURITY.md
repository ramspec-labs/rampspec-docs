# Security Policy

## Supported versions

RampSpec is pre-release. Only the current default branch is maintained until the first stable documentation release. Supported versions and backport windows will be listed here when stable releases exist.

## Report a vulnerability privately

Do not open a public issue for suspected vulnerabilities, leaked secrets, exposed personal data, unauthorized target access, transaction-signing weaknesses, tenant isolation failures, or ways to bypass runner network controls.

Use GitHub private vulnerability reporting for `rampspec-labs/rampspec-docs`. If that feature is unavailable, contact an organization owner through the private contact channel listed on the RampSpec Labs GitHub organization. Include affected versions, impact, reproduction steps that use synthetic data, and any known mitigations. Do not include active credentials or exploit systems you do not own.

The team will acknowledge a report within three business days, assess severity and ownership, coordinate fixes across affected repositories, and publish an advisory when disclosure is safe. Acknowledgement is not a promise of a specific remediation date or bounty.

## Documentation security scope

This repository treats unsafe commands, credential exposure, private endpoint disclosure, incorrect cryptographic verification, and misleading deployment claims as security-relevant documentation defects. Runtime vulnerabilities are routed to the repository that owns the affected implementation.
