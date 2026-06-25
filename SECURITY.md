# Security Policy

## Supported Versions

Currently, only the latest release of the application is supported with security updates. We highly recommend keeping your branch and dependencies up to date.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Security is a top priority for this project. If you discover a vulnerability, we would like to know about it so we can take steps to address it as quickly as possible.

**Do NOT report security vulnerabilities via public GitHub issues.**

Instead, please send an email to:
**[Your Admin Email / Security Contact]**
*(e.g., admin@yourdomain.com)*

Please include the following information in your report:
- Type of issue (e.g., buffer overflow, SQL injection, XSS)
- Full paths of source file(s) related to the manifestation of the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### What to expect

1. We'll acknowledge receipt of your vulnerability report within 48 hours.
2. We'll send you a confirmation of the issue and let you know what steps we're taking to address it.
3. We'll release a patch or update to fix the vulnerability and publish a security advisory.

## Best Practices Implemented in This Application
- Anti-DDoS and Brute Force Mitigation via Rate Limiting (RPM).
- Upstash Redis for fast in-memory caching and session handling.
- reCAPTCHA v3 on critical endpoints (Login, Register).
- Helmet & secure Express.js headers.
- Data Validation & Sanitization before database processing.
- JWT and Secure Cookies for stateless session management.
