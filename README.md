# AK Enterprises — Waterproofing Landing Page + Leads CRM

Static landing page for AK Enterprises, a waterproofing contractor serving
Ghaziabad NCR, plus a small CRM for the leads it collects.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The landing page — hero + lead form, services, gallery, reviews, FAQ, footer |
| `thank-you.html` | Post-submit page with the 3-question qualifying survey |
| `crm.html` | Password-protected leads dashboard (not linked from the site) |
| `assets/ak-leads.js` | Posts form submissions to Supabase |
| `assets/` | Logo and Google mark (gallery photos are served from Cloudinary) |

Plain HTML/CSS with vanilla JS. No build step, no dependencies, no SDK — the
Supabase calls are ordinary `fetch` requests, so a CDN outage cannot stop the
forms from working.

## Where the data goes

Supabase project **AK Enterprises CRM** (`yasmylhhnltrgufwsxoe`, region
ap-south-1 / Mumbai).

| Table | Rows |
| --- | --- |
| `leads` | One per lead form submission — hero form and modal both write here |
| `lead_surveys` | The three thank-you page answers, linked to the lead |
| `crm_users` | Email allow-list of people permitted to open the CRM |

`leads` also captures `page_url`, `referrer`, `utm_*` and `user_agent`, so paid
traffic can be attributed later without touching the forms again.

### Security model

The publishable key in `assets/ak-leads.js` is public by design. It is safe
because the database, not the key, enforces access:

- **The public can only INSERT.** No `SELECT`, `UPDATE` or `DELETE` grant
  exists for the anonymous role, so a visitor can never read anyone's leads.
- **`status` and `notes` are not insertable.** Column-level grants exclude
  them, so a crafted request cannot mark itself "won" or inject notes.
- **The client mints its own row UUID**, because with no `SELECT` right there
  is no way to read a generated id back for the survey to reference.
- **Reading requires a signed-in user whose email is in `crm_users`.** Public
  sign-ups are therefore harmless: an account not on that list sees nothing.

All of the above is verified — anonymous `SELECT`, `UPDATE`, `DELETE` and a
`status` injection attempt each return HTTP 401.

## Using the CRM

Open `/crm.html` and sign in. It lists every lead newest-first with the survey
answers, lets you set a status (`new → contacted → quoted → won / lost / spam`),
keep notes, search, filter, call or WhatsApp in one tap, and export CSV.

**To create a login:** Supabase dashboard → Authentication → Users → *Add user*,
using an email already present in `crm_users`. To let someone else in, add
their email to that table first.

## Deploying

Static host, nothing to configure — no build command, no output directory.
Pushing to `main` triggers a Vercel production deploy.

## Known gaps

- **No spam protection on the form.** Anyone can script submissions against the
  insert endpoint. Add a CAPTCHA or a rate-limiting edge function if junk leads
  start appearing; the `spam` status exists to file them under meanwhile.
- **A failed lead submission is not retried.** The visitor sees an error asking
  them to call or WhatsApp instead. A retry queue would close this gap.
- **No email or WhatsApp alert on a new lead.** Someone has to open the CRM.

## Source

Generated from a Claude Design canvas export (`.dc.html`). The design runtime,
templating (`<sc-if>`, `{{ }}`) and `style-hover`/`style-focus` attributes were
compiled down to static HTML, real CSS `:hover`/`:focus` rules and vanilla JS.
