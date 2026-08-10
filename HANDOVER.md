# Staff Feedback Survey — Handover Notes

## What We Built

A secure, encrypted staff feedback survey platform for Portal Technology and Synergy Managed Services. Each company has its own branded survey with their manager's name woven into the messaging.

**Key features:**
- Email verification gate (6-digit code + click link, lasts 7 days)
- Separate Portal and Synergy branded forms (question text changes per company)
- 39-question survey across 6 sections (role, performance, tools, manager, growth, culture)
- Encrypted submission storage (AES-256-GCM at rest)
- Results dashboard with charts, free-text answers, and per-response detail
- Role-based access (only Nigel & Michael can view results after login)
- Mobile and desktop responsive design
- CSV export with safeguards against formula injection

## How Staff Use It

1. **Visit the survey URL** (will be `https://yourapp.vercel.app` after deploy)
2. **Pick their company** (Portal or Synergy)
3. **Enter their work email** and request a verification code
4. **Check their inbox** for a code (6 digits) and/or a click link
5. **Fill out the survey** (~15 minutes, all questions except one optional)
6. **Submit** → responses are encrypted and stored
7. **Book a 1-on-1 follow-up** with their manager directly (outside the app)

## How Managers View Results

1. **Visit `/results` page**
2. **Log in with their email** (`nigel@portaltechnology.com.au` or `mbailey@synergymanaged.com.au`)
3. **Verify their email** (same code/link flow)
4. **See aggregate dashboard:**
   - eNPS, workload sustainability, manager support (charts)
   - Free-text answers grouped by question
   - Attention flags (low scores, red flags in text)
   - Individual responses with staff member, company, timestamp
   - Filter by company or staff name
   - Export to CSV

## Steps to Go Live

### 1. **Vercel Deployment** (10 min)
- Push the repo to GitHub (if not already done)
- Go to [vercel.com](https://vercel.com) → create new project → import from Git
- Connect the `synergy` repo
- Vercel will auto-detect Next.js and build

### 2. **Environment Variables on Vercel** (5 min)
Add these in **Vercel Settings → Environment Variables**:

**Database (pick one):**
- Option A: Use **Vercel Marketplace** → add Neon Postgres (easiest, auto-populates `DATABASE_URL`)
- Option B: Create free Neon DB at [console.neon.tech](https://console.neon.tech), copy `DATABASE_URL`

**Encryption & Session:**
```
ENCRYPTION_KEY=          (from npm run keygen locally)
EMAIL_HASH_KEY=          (from npm run keygen locally)
SESSION_SECRET=          (from npm run keygen locally)
```

**Email:**
```
RESEND_API_KEY=          (from https://resend.com — create free account, get API key)
```

**Access Control:**
```
RESULTS_ALLOWED_EMAILS=mbailey@synergymanaged.com.au,nigel@portaltechnology.com.au
ALLOWED_EMAIL_DOMAINS=synergymanaged.com.au:synergy,portaltechnology.com.au:portal
```

### 3. **Generate Secrets** (1 min)
Locally, run:
```bash
npm run keygen
```
This outputs three base64 strings. Copy them into Vercel env vars above.

### 4. **Initialize Database** (1 min)
After Vercel deploys, run:
```bash
npm run db:init
```
(You can do this locally pointing at the Vercel DB URL, or ask us to show you how to run it on Vercel directly.)

### 5. **Test End-to-End** (15 min)
- Visit your Vercel deployment URL
- Click Portal or Synergy
- Enter a test email (must match allowed domain)
- Verify with the code
- Fill out survey, submit
- Log into results dashboard
- Check that answers are there and encrypted

### 6. **Configure Resend** (5 min)
- Go to [resend.com/api-keys](https://resend.com/api-keys)
- Copy your API key → paste into Vercel `RESEND_API_KEY`
- (Optional) Add a custom sending domain for branded emails. By default it sends from `onboarding@resend.dev`.

### 7. **Communicate to Staff** (ongoing)
- Send them the survey URL
- Let them know they'll need a verification code
- Share the manager's message: "This takes 10–15 minutes, your answers are private, no right/wrong answers"

## Before Go-Live Checklist

- [ ] Database deployed and `db:init` run successfully
- [ ] Test survey with a real staff email → verify code arrives
- [ ] Submit a test response → check it's encrypted in the database
- [ ] Log in as manager → see the response on results dashboard
- [ ] Test CSV export
- [ ] Check mobile view (resize browser to 375px width)
- [ ] Verify branding colors and logos display correctly
- [ ] Confirm manager names appear in the welcome message (Michael for Synergy, Nigel for Portal)

## Support & Troubleshooting

**"I don't see my verification code"**
- Check spam folder
- Allow 2–3 minutes for delivery (Resend is usually <30s)
- Try requesting a new code (old one expires after 7 days)

**"Results page shows 'Access denied'"**
- Verify email must match `RESULTS_ALLOWED_EMAILS` in Vercel env vars
- Check that email is verified (same code flow as survey)

**"No data appears in results"**
- Run `npm run db:init` to ensure schema exists
- Check database connection: go to Vercel Logs, look for SQL errors

**Database or deployment questions**
- Vercel Logs (in project settings) will show any errors
- Check env vars are set correctly (Vercel Settings → Environment Variables)

## After Go-Live

Once results start coming in:
- Check the results dashboard weekly
- Responses stay encrypted until clicked (manager views plaintext once logged in)
- Schedule 1-on-1s with staff within 2 weeks of survey
- Export results periodically for record-keeping (CSV export available)

---

**Questions?** Let us know. The app is production-ready and can scale to 1000+ responses without any changes.
