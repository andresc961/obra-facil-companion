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
