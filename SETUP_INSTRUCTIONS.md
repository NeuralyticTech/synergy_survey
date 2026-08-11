# Staff Feedback Survey — Setup Instructions

The survey is live and ready. To enable email verification and branding, we need to set up email sending through your own domains.

---

## What You Need to Do

### Step 1: Set Up Email Domain in Resend (Nigel & Michael)

**Nigel (Portal Technology):**
1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `survey.portaltechnology.com.au`
4. Click **Add**
5. Copy all 4 DNS records shown (you'll need these next)

**Michael (Synergy Managed Services):**
1. Go to [resend.com/domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `survey.synergymanaged.com.au`
4. Click **Add**
5. Copy all 4 DNS records shown (you'll need these next)

*Alternative:* If you prefer to use a different subdomain (e.g. `feedback.portaltechnology.com.au`), you can. Just use that instead in the steps below.

---

### Step 2: Add DNS Records in Cloudflare (Nigel & Michael)

**For each domain you set up above:**

1. Log into [Cloudflare](https://dash.cloudflare.com)
2. Select your domain (`portaltechnology.com.au` or `synergymanaged.com.au`)
3. Go to **DNS** → **Records**
4. For each of the 4 records from Resend:
   - Click **Add Record**
   - **Type:** TXT (or MX/SPF as shown)
   - **Name:** Copy from Resend
   - **Content:** Copy from Resend
   - **TTL:** Auto
   - Click **Save**
5. Repeat for all 4 records
6. Wait 5–10 minutes for DNS to propagate

Resend will auto-verify once the records are live.

---

### Step 3: Confirm Verification (Nigel & Michael)

Once DNS is live (5–10 min):
1. Go back to [resend.com/domains](https://resend.com/domains)
2. Your domain should show as **Verified** ✓
3. **Send Sean a message** saying it's verified

<span style="color: #999; font-size: 13px;">*Sean will then update the email sending configuration and redeploy the app.*</span>

---

## What Sean Will Do

<span style="color: #999; font-size: 13px;">
- Update Vercel environment variables to use the verified domains
- Add both survey subdomains as custom domains in Vercel (so staff can visit survey.portaltechnology.com.au / survey.synergymanaged.com.au)
- Redeploy the app
- Send you the updated survey link
</span>

---

## Timeline

- **Your work:** 15 minutes (Resend + Cloudflare setup)
- **Wait:** 5–10 minutes (DNS propagation)
- **Sean's work:** 5 minutes
- **Live:** Same day

---

## Questions?

If you get stuck on Cloudflare DNS:
- DNS records are in the **DNS** tab, not the routing rules
- Make sure you're adding records for the *subdomain* (e.g. `survey`, not the full domain)
- If Resend says "Not Found", wait another 5 minutes and refresh

Once verified, staff will receive real emails with no delays or spam issues.
