# Staff 360 Survey — AI & Data Privacy Statement

## No AI Processing

The Staff 360 Survey application **does not use any artificial intelligence or machine learning models**. Specifically:

- ✅ No LLMs (Large Language Models) are involved
- ✅ No data is sent to OpenAI, Claude, ChatGPT, or any third-party AI service
- ✅ No automated analysis or profiling occurs
- ✅ All responses remain exactly as staff members submit them

## Data Storage & Security

- **Encrypted at rest:** All survey responses are encrypted using AES-256-GCM before storage
- **Private database:** Data is stored in your own Neon Postgres database, not a shared cloud platform
- **Access controlled:** Only the two specified managers (Nigel & Michael) can view results after email verification
- **No third-party access:** No SaaS vendor, AI provider, or external service has access to survey data

## Technology Stack

The app is built on standard, well-established web technologies:
- Next.js 16 (React framework)
- PostgreSQL (database)
- Tailwind CSS (styling)
- Resend (email delivery)
- Vercel (hosting)

None of these platforms use survey data for AI training or processing.

## Comparison: SurveyMonkey vs This Solution

| Aspect | This App | SurveyMonkey |
|--------|----------|-------------|
| **Data ownership** | You own it (encrypted in your DB) | SurveyMonkey owns/hosts it |
| **Third-party access** | None (except email/hosting providers) | SurveyMonkey's terms apply; may process for analytics |
| **AI/ML usage** | None | Subject to their privacy policy; may use for insights/recommendations |
| **Data export** | Full control, encrypted | Limited by their export tools |
| **Cost** | One-time setup | Ongoing subscription per user |
| **Customization** | Complete (open source code) | Limited to their feature set |

Staff concerns about AI are valid, and this custom solution actually provides **stronger privacy** than commercial survey platforms, which typically reserve the right to process your data for their own analytics and recommendations.

---

**Bottom line:** There is no AI in this application. Your staff data stays private and encrypted. This is a safer approach than delegating to a third-party SaaS tool that may have unclear data-sharing practices.
