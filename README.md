# AK Enterprises — Waterproofing Landing Page

Static landing page for AK Enterprises, a waterproofing contractor serving Ghaziabad NCR.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | The landing page — hero + lead form, services, gallery, reviews, FAQ, footer |
| `thank-you.html` | Post-submit page with the 3-question qualifying survey |
| `assets/` | Logo and Google mark (gallery photos are served from Cloudinary) |

Everything is plain HTML/CSS with a small amount of vanilla JS (FAQ accordion,
lead-capture modal, mobile sticky CTA bar). No build step, no dependencies.

## Deploying

Any static host works. On Vercel there is nothing to configure — no build
command, no output directory.

## Known gap: the lead form does not send anywhere

Both lead forms (the hero form and the modal) currently just redirect to
`thank-you.html`. Submissions are **not** emailed, stored, or forwarded. The
survey on the thank-you page likewise only toggles a confirmation message.

Wiring this up needs a form backend — a Vercel serverless function plus an email
provider, or a hosted service such as Formspree, Web3Forms or Google Forms.
Until then, the phone and WhatsApp buttons are the only working lead channels.

## Source

Generated from a Claude Design canvas export (`.dc.html`). The design runtime,
templating (`<sc-if>`, `{{ }}`) and `style-hover`/`style-focus` attributes were
compiled down to static HTML, real CSS `:hover`/`:focus` rules and vanilla JS.
