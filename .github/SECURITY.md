# Security Policy

> **CELLM** - Spec-Driven Development System for AI Agents

This document outlines security procedures and policies for the CELLM project.

---

## Supported Versions

Security updates are provided for the following versions:

| Version | Status | Support Level |
|---------|--------|---------------|
| 2.0.x   | Current | [+] Full security support |
| < 2.0   | Legacy | [-] No support |

We recommend always using the latest version to ensure you have all security patches.

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, report vulnerabilities through our official channel:

1. **GitHub Security Advisories** (Mandatory)
   - Navigate to [Security Advisories](https://github.com/murillodutt/cellm/security/advisories)
   - Click "Report a vulnerability"
   - Provide detailed information

Using GitHub Security Advisories ensures that the vulnerability is tracked, triaged, and resolved within the project's integrated workflow, maintaining a centralized audit trail.

### What to Include

A good vulnerability report includes:

| Element | Description |
|---------|-------------|
| **Summary** | Clear, concise description of the vulnerability |
| **Severity** | Your assessment (Critical/High/Medium/Low) |
| **Affected Components** | Files, modules, or features affected |
| **Reproduction Steps** | Detailed steps to reproduce the issue |
| **Impact** | Potential consequences if exploited |
| **Suggested Fix** | Optional: your recommended remediation |

### Example Report Format

```
## Summary
[Brief description of the vulnerability]

## Severity Assessment
[Critical/High/Medium/Low] - [Justification]

## Affected Components
- File: cellm/skills/...
- Version: 2.0.x

## Steps to Reproduce
1. [Step one]
2. [Step two]
3. [Observed result]

## Impact
[Description of potential impact]

## Suggested Remediation
[Optional: Your recommended fix]
```

---

## Response Process

### Timeline

| Phase | Timeframe | Action |
|-------|-----------|--------|
| Acknowledgment | 48 hours | Initial response confirming receipt |
| Assessment | 7 days | Severity evaluation and impact analysis |
| Resolution | 30 days | Patch development for confirmed issues |
| Disclosure | 90 days | Public disclosure after fix deployment |

### What to Expect

1. **Acknowledgment**: You will receive confirmation within 48 hours
2. **Communication**: We will maintain contact throughout the process
3. **Updates**: Status updates at least every 7 days for active investigations
4. **Credit**: Recognition in the security advisory (unless you prefer anonymity)

---

## Security Scope

### In Scope

The following are considered valid security concerns:

| Category | Examples |
|----------|----------|
| **Injection** | Malicious content injection via skills/agents |
| **Information Disclosure** | Unintended exposure of sensitive data |
| **Privilege Escalation** | Bypassing intended access controls |
| **MCP Server** | Vulnerabilities in the MCP server |
| **Supply Chain** | Compromised dependencies |
| **Configuration** | Insecure default configurations |

### Out of Scope

The following are NOT considered security vulnerabilities:

| Category | Reason |
|----------|--------|
| Social engineering | User education issue |
| Physical access attacks | Outside threat model |
| Issues in user-created content | User responsibility |
| Outdated dependencies without CVE | Not actionable |

---

## Security Best Practices

### For Users

```
[+] DO:
- Keep CELLM plugin updated to the latest version
- Review skills and agents before using them
- Report suspicious patterns or behaviors

[-] DO NOT:
- Use untrusted third-party plugins without review
- Share sensitive project information in public content
- Ignore security warnings
```

### For Contributors

```
[+] DO:
- Follow secure coding practices
- Validate all inputs
- Review dependencies regularly

[-] DO NOT:
- Include hardcoded credentials
- Bypass validation mechanisms
- Introduce external dependencies without review
- Commit sensitive test data
```

### Validation

The CI workflow validates plugin structure on every push and PR.

---

## Security Updates

### Notification Channels

Security updates are announced through:

| Channel | Type | URL |
|---------|------|-----|
| GitHub Releases | Primary | [Releases](https://github.com/murillodutt/cellm/releases) |
| GitHub Security Advisories | Critical | [Advisories](https://github.com/murillodutt/cellm/security/advisories) |
| Repository CHANGELOG | All updates | [CHANGELOG.md](CHANGELOG.md) |

---

## Recognition

We appreciate security researchers who help improve CELLM security.

Contributors who report valid security issues will be acknowledged in:

- Security advisory credits
- CHANGELOG.md security section
- Project documentation (with permission)

---

## Compliance

### Standards Alignment

CELLM security practices align with:

- [OWASP Security Guidelines](https://owasp.org/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Open Source Security Foundation](https://openssf.org/)

### Dependency Management

- Plugin uses bundled JavaScript executables (no external dependencies)
- Dependabot is enabled for GitHub Actions security updates
- MCP server uses Bun runtime with minimal dependencies

---

## Contact

For security-related communications:

| Purpose | Contact |
|---------|---------|
| Security Reports | [GitHub Security Advisories](https://github.com/murillodutt/cellm/security/advisories) |
| General Questions | [GitHub Discussions](https://github.com/murillodutt/cellm/discussions) |

---

## Policy Updates

This security policy may be updated periodically. Changes will be reflected in this document with appropriate version tracking.

**Last Updated**: 2026-01-23
**Policy Version**: 2.0.0

---

**CELLM** - Spec-Driven Development System for AI Agents
**Maintainer**: Dutt Yeshua Technology Ltd
**License**: MIT
