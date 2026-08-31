# Dependency Security Debt

Last reviewed: 2026-08-27

`npm audit` currently reports eight high-severity findings and no critical findings. They are build-time dependencies reached through `astro-compress`; the published site is static Cloudflare Pages output and does not run these packages for visitors. This does not remove the need to upgrade: the build environment still processes repository content and assets.

| Dependency | Severity | Runtime exposure | Upgrade path | Breaking risk |
| --- | --- | --- | --- | --- |
| `astro-compress` → `@playform/pipe`, `deepmerge-ts`, `sharp`, `svgo` | High | Build-time asset and HTML compression only; no public Node runtime | Evaluate `astro-compress@2.3.0` or replace/remove the compressor after a clean V2 build and output comparison | Major-version change; compression behavior and Astro compatibility must be checked |
| `fast-uri` | High | Transitive build/development dependency; no visitor request handler | Update the owning dependency tree with a lockfile-only, tested upgrade | Dependency resolution may alter other transitive versions |
| `fast-xml-parser` | High | Transitive build/development dependency; no visitor request handler | Update the owning dependency tree and rerun template/build audits | Parser behavior can affect generated metadata or tooling |
| `js-yaml` | High | Transitive build/development dependency; no visitor request handler | Update the owning dependency tree and rerun the full generator regression suite | YAML parser compatibility needs regression coverage |

## Resolution Gate

Do not run `npm audit fix --force` in a production site or template. Resolve this in a separate dependency-maintenance change that verifies:

1. `npm run check`, `npm run build`, and all template audits;
2. V1 and V2 generator regressions;
3. static output and affiliate-link behavior; and
4. a fresh `npm audit` report.
