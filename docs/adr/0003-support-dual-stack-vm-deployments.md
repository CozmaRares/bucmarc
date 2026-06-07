# Support Network-Family Independent Deployments

Bucmarc must be reachable regardless of whether a client network, host network, or deployment path supports IPv4, IPv6, or both. The deployment configuration should not assume that every network has the same address-family support.

**Considered Options**

- Bind only one address family and require every network path to support it.
- Bind both address families and let the client, DNS, host, and routing environment choose the working path.

**Consequences**

Development and production deployment configs must bind both IPv4 and IPv6 addresses where the host supports them. Values such as `APP_URL` must represent the real externally reachable origin for the deployed VM, because Bucmarc uses that origin for share URLs and Clerk redirect URLs. DNS should publish the address records supported by the host so clients can select a reachable path.
