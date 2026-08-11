# DNS Setup for Staff 360 Survey

## Current Status

The survey is live at **synergy-staff-survey.vercel.app**. Email verification is working but emails are being flagged as spam because the domain is brand new.

To enable branded email sending and improve deliverability, we need to configure DNS records in Cloudflare.

## What's Been Done

Sean has pre-configured the survey to work with your company domains:

**In Resend:**
- `portaltechnology.com.au`
- `synergymanaged.com.au`

**In Vercel:**
- `survey.portaltechnology.com.au`
- `survey.synergymanaged.com.au`

You can set up both or just one — whichever you prefer.

---

## Step 1: Add DNS Records in Cloudflare

1. Log into [Cloudflare](https://dash.cloudflare.com)
2. Select your domain:
   - `portaltechnology.com.au` and/or
   - `synergymanaged.com.au`
3. Go to **DNS** → **Records**
4. For each domain, add these 3 records:

### DKIM Record

| Field | Value |
|-------|-------|
| **Type** | TXT |
| **Name** | `resend._domainkey` |
| **Value** | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDX0Td904eEtMoeXhyjv5VwWSDLpc/9hhZxjXRCj5UC1OE+0KaP/fJMTDeCOvcqh75qzxDn7I7flJALCb/laYOX38TuNZc56pSThpCBzhHnuRKZRPGp3zOaY40427mVxO3nlCCXalI2Jr+pZeaIRkwrrU/ivtoCZ4SA6+ndG+V2QwIDAQAB` |
| **TTL** | Auto |

### SPF Record

| Field | Value |
|-------|-------|
| **Type** | TXT |
| **Name** | `send` |
| **Value** | `v=spf1 include:amazonses.com ~all` |
| **TTL** | Auto |

### MX Record

| Field | Value |
|-------|-------|
| **Type** | MX |
| **Name** | `send` |
| **Value** | `feedback-smtp.ap-northeast-1.amazonses.com` |
| **Priority** | 10 |
| **TTL** | Auto |

5. Repeat for the second domain if you're setting up both
6. Wait 5–10 minutes for DNS to propagate

---

## Step 2: Map Subdomain to Vercel

Add these records to point the survey subdomain to Vercel:

### For survey.portaltechnology.com.au

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Name** | `survey` |
| **Value** | `d9f79eef18739d38.vercel-dns-016.com.` |

| Field | Value |
|-------|-------|
| **Type** | TXT |
| **Name** | `_vercel` |
| **Value** | `vc-domain-verify=survey.portaltechnology.com.au,744f64f29dc77bb0ab29` |

### For survey.synergymanaged.com.au

| Field | Value |
|-------|-------|
| **Type** | CNAME |
| **Name** | `survey` |
| **Value** | `d9f79eef18739d38.vercel-dns-016.com.` |

---

## Timeline

- **Your work:** 15 minutes (Cloudflare DNS setup)
- **Wait:** 5–10 minutes (DNS propagation)
- **Once complete:** Email Sean to confirm verification

## Questions?

If you need help adding records in Cloudflare, the DNS interface shows field labels for each record type. Match the **Name**, **Type**, and **Value** exactly as shown above.

Once verified, staff will receive verification emails from your domain with no spam filtering.
