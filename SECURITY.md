# Security Policy

StoreBlocks generates stores that handle customer accounts, uploads, and payments, so we take security reports seriously.

## Supported Versions

| Version | Supported |
|---|---|
| Latest minor release | Yes |
| Older releases | No; please upgrade |

Before 1.0, only the latest `0.x` release receives fixes.

## Reporting a Vulnerability

**Do not open a public issue.**

Report privately through [GitHub Security Advisories](https://github.com/storeblocks/storeblocks/security/advisories/new) (Security tab → *Report a vulnerability*).

Please include:

- The affected package or module (CLI, a template module, an adapter)
- Steps to reproduce, or a proof of concept
- The impact you believe it has
- Any suggested fix

## What to Expect

- Acknowledgement within **3 days**
- An initial assessment within **7 days**
- A fix or mitigation plan, with you kept informed along the way
- Credit in the advisory and release notes, if you want it

## Scope

In scope:

- The `create-storeblocks` CLI and published packages
- Code in `templates/` that ends up in generated projects (auth, payments, storage, uploads, admin)
- Supply-chain issues in our dependency choices or publishing

Out of scope:

- Vulnerabilities in a store that the owner has modified
- Issues in third-party services (Stripe, SSLCommerz, Cloudinary, AWS) themselves
- Missing hardening on a deployment that ignores our production checklist

## For Store Owners

When a security fix affects generated code, the advisory will describe exactly which files to update in existing projects.
