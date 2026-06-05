# Support IPv6-Only VM Deployments

Bucmarc must run correctly on a VM where IPv4 routing is disabled. The deployment path should treat IPv6-only networking as the baseline, so nginx listeners, Docker network configuration, proxy targets, generated absolute URLs, and authentication redirects must not require IPv4 or localhost-only assumptions.

**Considered Options**

- Require dual-stack networking for deployed environments.
- Support IPv6-only deployments while allowing local development to use localhost.
- Treat IPv6-only networking as the deployed baseline.

**Consequences**

Development and production deployment configs must be checked for IPv6 bind addresses and routable external URLs. Values such as `APP_URL` must represent the real externally reachable IPv6-capable origin for the deployed VM, because Bucmarc uses that origin for share URLs and Clerk redirect URLs.
