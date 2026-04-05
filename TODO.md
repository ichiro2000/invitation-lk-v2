# INVITATION.LK — To Do Later

## SEO (Manual Steps)
- [ ] Submit sitemap to Google Search Console: https://invitation.lk/sitemap.xml
- [ ] Register on Google Business Profile with Colombo address
- [ ] Add the site to Bing Webmaster Tools
- [ ] Replace `public/og-image.svg` with a proper PNG/JPG design (1200x630px) for better social preview compatibility

## Payments (Activate When Ready)
- [ ] Add `STRIPE_SECRET_KEY` to DigitalOcean env vars
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to DigitalOcean env vars
- [ ] Add `STRIPE_WEBHOOK_SECRET` to DigitalOcean env vars
- [ ] Set up Stripe webhook endpoint: `https://invitation.lk/api/webhooks/stripe`

## Email (Activate When Ready)
- [ ] Add `RESEND_API_KEY` to DigitalOcean env vars
- [ ] Verify `invitation.lk` domain in Resend dashboard
- [ ] Add `NEXT_PUBLIC_APP_URL=https://invitation.lk` to DigitalOcean env vars
