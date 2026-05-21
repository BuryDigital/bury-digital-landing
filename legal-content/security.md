# Security

**Bury Digital Pty Ltd (ABN 31 850 554 300)**

**Last updated:** [DATE TO INSERT]

Security is a core requirement, not a feature. This page describes the technical and organisational measures we take to protect Customer Data and End User personal information, in line with Australian Privacy Principle 11 (Security of personal information).

## Infrastructure

- **Encrypted in transit.** All communication between users, our application, and our subprocessors uses TLS 1.2 or higher.
- **Encrypted at rest.** Customer Data stored in our database (Supabase Postgres) is encrypted at rest using AES-256.
- **Australian-hosted database.** Our primary database is located in the Sydney (ap-southeast-2) region.
- **Edge security.** Cloudflare provides DDoS protection, Web Application Firewall, and bot mitigation at the network edge.

## Multi-tenancy and isolation

- **Row-Level Security (RLS).** Our database enforces strict tenant isolation at the row level. A Customer can only access data belonging to their own account, enforced at the database engine, not just in application code.
- **No shared credentials.** Each Customer authenticates with their own credentials. We do not use shared API keys or accounts across Customers.

## Access controls

- **Least privilege.** Bury Digital personnel access production data only when necessary to deliver support or operate the Service.
- **Audit logging.** Administrative actions are logged.
- **Strong authentication.** Access to our infrastructure requires strong, unique credentials and, where supported, multi-factor authentication.

## AI processing

- **No training on Customer Data.** We do not use any Customer Data or End User Data to train artificial intelligence models, including our own.
- **API-only AI processing.** AI qualification runs via the Anthropic API, which under Anthropic's commercial terms does not retain or train on inbound API data.

## Subprocessors

We use a small number of carefully chosen subprocessors. Each is reviewed for security and privacy posture before being engaged. The full list is published at [bury-digital.com/subprocessors.html](https://bury-digital.com/subprocessors.html).

## Backups and continuity

- Customer Data is backed up regularly via our database provider's native backup mechanisms.
- We can restore from backups in the event of data loss caused by infrastructure failure.

## Incident response

- We monitor the Service for security incidents.
- If we become aware of a personal information breach that is likely to cause serious harm, we will notify affected Customers and the Office of the Australian Information Commissioner (OAIC) in accordance with the Notifiable Data Breaches scheme.
- Our target notification window for likely-serious breaches is **72 hours** from the time we form a reasonable belief that a breach has occurred.

## What we ask of Customers

Security is shared. To help keep your data safe:

- Use a strong, unique password for your Bury Digital account
- Do not share account credentials
- Notify us immediately at oscar@bury.com.au if you suspect unauthorised access
- Keep your contact details current so we can reach you about security matters

## Reporting a vulnerability

If you believe you have found a security vulnerability in the Service, please email oscar@bury.com.au with details. We commit to:

- Acknowledging your report within 3 business days
- Investigating and responding promptly
- Not pursuing legal action against good-faith researchers who follow responsible disclosure

## Contact

Questions about security? Email oscar@bury.com.au.
