<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Quote quota is enforced server-side by the `consume_quote` DB function (subscription > free > paid credit) after a quote is generated; never count quotes in the browser.
- Paid quote credits are granted only by the payments webhook via `add_quote_credits`, keyed by checkout session id so retries never double-grant.
- Company logos are stored as small data URLs in `business_profiles` because public storage buckets are blocked in this workspace.
- Quote PDFs are generated from current quote data with pdf-lib in a lazy-loaded browser module; prepare the Blob before clicking to preserve mobile download/share activation.
- Per-quote company branding is resolved through selectedBrand for preview, PDF and WhatsApp together, so subscriber eligibility and opt-out stay consistent.

- Search metadata lives on leaf routes; the root contains sitewide defaults only to avoid conflicting page identities.
- The sitemap derives public URLs from required route staticData.sitemap decisions; exclude the authenticated subtree and utility routes to keep customer surfaces out of discovery. Use authoritative page-specific lastmod timestamps only, otherwise omit them.
- /probar is a public, account-free single quote preview via generateDemoQuote (never consumes quota or saves); one try per browser keeps AI cost low.
