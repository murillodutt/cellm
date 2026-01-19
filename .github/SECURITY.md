# Security Policy

> **CELLM** - Context Engineering for Large Language Models

This document outlines security procedures and policies for the CELLM project.

---

## Supported Versions

Security updates are provided for the following versions:

| Version | Status | Support Level |
|---------|--------|---------------|
| 0.10.x  | Current | [+] Full security support |
| < 0.10  | Legacy | [-] No support |

We recommend always using the latest version to ensure you have all security patches.

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, report vulnerabilities through one of these channels:

1. **GitHub Security Advisories** (Preferred)
   - Navigate to [Security Advisories](https://github.com/murillodutt/cellm/security/advisories)
   - Click "Report a vulnerability"
   - Provide detailed information

2. **Email**
   - Send details to: `security@cellm.ai` (coming soon)
   - Use subject line: `[SECURITY] Brief description`
   - Encrypt sensitive details if possible

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
- File: cellm-core/rules/...
- Version: 0.10.x

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

### Response Workflow

```
Report Received
      |
      v
[Acknowledgment] --> 48h response
      |
      v
[Triage & Assessment] --> Severity classification
      |
      v
[Investigation] --> Root cause analysis
      |
      v
[Remediation] --> Patch development
      |
      v
[Release] --> Security update published
      |
      v
[Disclosure] --> Advisory published
```

### What to Expect

1. **Acknowledgment**: You will receive confirmation within 48 hours
2. **Communication**: We will maintain contact throughout the process
3. **Updates**: Status updates at least every 7 days for active investigations
4. **Credit**: Recognition in the security advisory (unless you prefer anonymity)

---

## Disclosure Policy

CELLM follows a **Coordinated Disclosure** approach:

### Timeline

- **Day 0**: Vulnerability reported
- **Day 1-7**: Initial assessment and severity classification
- **Day 8-30**: Patch development and testing
- **Day 31-45**: Patch release and user notification
- **Day 90**: Public disclosure (or earlier if patch is deployed)

### Exceptions

| Scenario | Action |
|----------|--------|
| Active exploitation | Accelerated disclosure |
| Third-party dependency | Coordinate with upstream maintainer |
| Minor severity | May extend timeline to 120 days |
| Reporter request | May adjust timeline within reason |

---

## Security Scope

### In Scope

The following are considered valid security concerns:

| Category | Examples |
|----------|----------|
| **Injection** | Malicious content injection via rules/patterns |
| **Information Disclosure** | Unintended exposure of sensitive data |
| **Privilege Escalation** | Bypassing intended access controls |
| **Schema Validation** | Bypass of JSON Schema validation |
| **Supply Chain** | Compromised dependencies |
| **Configuration** | Insecure default configurations |

### Out of Scope

The following are NOT considered security vulnerabilities:

| Category | Reason |
|----------|--------|
| Social engineering | User education issue |
| Physical access attacks | Outside threat model |
| Denial of service via large files | Expected behavior limitation |
| Issues in user-created rules | User responsibility |
| Outdated dependencies without CVE | Not actionable |
| Self-inflicted issues | User misconfiguration |

### CELLM-Specific Considerations

CELLM is a **context management system** for AI tools. Security considerations include:

1. **Context Injection**: Rules and patterns should not allow injection of malicious instructions
2. **Schema Integrity**: JSON Schema validation must prevent malformed configurations
3. **File Boundaries**: The system should respect defined file path boundaries
4. **Token Budget**: Context loading should respect defined limits

---

## Security Best Practices

When using CELLM, follow these guidelines:

### For Users

```
[+] DO:
- Keep CELLM updated to the latest version
- Review rules and patterns before applying them
- Use validation scripts before deployment
- Report suspicious patterns or behaviors

[-] DO NOT:
- Use untrusted third-party rules without review
- Disable schema validation
- Share sensitive project information in public rules
- Ignore validation warnings
```

### For Contributors

```
[+] DO:
- Follow secure coding practices
- Validate all inputs
- Use parameterized patterns
- Review dependencies regularly

[-] DO NOT:
- Include hardcoded credentials
- Bypass validation mechanisms
- Introduce external dependencies without review
- Commit sensitive test data
```

### Validation

Always run validation before deploying changes:

```bash
# Validate structure and schemas
./scripts/validate.sh

# Check frontmatter validity
./scripts/check-frontmatter.sh

# Run security-related tests
npm test
```

---

## Security Updates

### Notification Channels

Security updates are announced through:

| Channel | Type | URL |
|---------|------|-----|
| GitHub Releases | Primary | [Releases](https://github.com/murillodutt/cellm/releases) |
| GitHub Security Advisories | Critical | [Advisories](https://github.com/murillodutt/cellm/security/advisories) |
| Repository CHANGELOG | All updates | [CHANGELOG.md](CHANGELOG.md) |

### Update Process

1. Monitor the channels above for announcements
2. Review the security advisory details
3. Update to the patched version
4. Re-run validation scripts
5. Verify system behavior

---

## Recognition

We appreciate security researchers who help improve CELLM security.

### Hall of Thanks

Contributors who report valid security issues will be acknowledged in:

- Security advisory credits
- CHANGELOG.md security section
- Project documentation (with permission)

### Recognition Criteria

| Severity | Recognition |
|----------|-------------|
| Critical | Named credit + detailed acknowledgment |
| High | Named credit in advisory |
| Medium | Credit in CHANGELOG |
| Low | Credit in CHANGELOG (optional) |

To opt out of public recognition, indicate your preference when reporting.

---

## Compliance

### Standards Alignment

CELLM security practices align with:

- [OWASP Security Guidelines](https://owasp.org/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Open Source Security Foundation](https://openssf.org/)

### Dependency Management

- Dependencies are tracked in `package.json` and `package-lock.json`
- Dependabot is enabled for automated security updates
- Regular dependency audits via `npm audit`

---

## Contact

For security-related communications:

| Purpose | Contact |
|---------|---------|
| Security Reports | [GitHub Security Advisories](https://github.com/murillodutt/cellm/security/advisories) |
| General Questions | [GitHub Discussions](https://github.com/murillodutt/cellm/discussions) |
| Email (coming soon) | security@cellm.ai |

---

## Policy Updates

This security policy may be updated periodically. Changes will be reflected in this document with appropriate version tracking.

**Last Updated**: 2026-01-18
**Policy Version**: 1.0.0

---

**CELLM** - Context Engineering for Large Language Models
**Maintainer**: Dutt Yeshua Technology Ltd
**License**: MIT
