# WWW redirect

Dedicated Worker for the owner-authorized `www.baulingo.app` → `https://baulingo.app` permanent redirect. HTTP and HTTPS paths and query strings are retained. Other hostnames return 404. The main `baulingo-site` deployment remains static.

The authenticated Wrangler OAuth login grants Worker routes but Cloudflare returned 403 for the zone's Redirect Rules API. This Worker uses the available Worker permissions rather than requesting another credential. It runs only on WWW requests, within the account's Workers allowance; deployment does not enable or upgrade any paid plan. No bindings, storage, analytics, request logging or origin fetches are added.

```powershell
npm test
npx --yes wrangler@4.156.0 deploy --config cloudflare/www-redirect/wrangler.json --dry-run --outdir .dev/www-redirect-dry-run
# Publishes the redirect and attaches the WWW route:
npx --yes wrangler@4.156.0 deploy --config cloudflare/www-redirect/wrangler.json
```

The WWW DNS record must already be proxied by Cloudflare. Deploying this configuration does not edit DNS or the apex site's custom domain. The root Git-linked site's build does not publish or deploy this directory.

Rollback: remove the `www.baulingo.app/*` route from **baulingo-www-redirect → Settings → Domains & Routes**. Delete the dedicated Worker afterward if no longer needed. Do not remove the apex site's custom domain.

Verify a direct 301 Location for `http://www.baulingo.app/`, `https://www.baulingo.app/` and `https://www.baulingo.app/konular/cases/?q=artikel&from=www`. Also verify the destination remains 200 and an unknown apex path remains 404.

## Deployed and verified

Deployed with the owner's authorized Cloudflare login on 30 October 2026. Version: `12357254-9074-4dcb-acb0-c3b5218ca07c`. Active route: `www.baulingo.app/*` in the `baulingo.app` zone.

Live checks passed for direct HTTP/HTTPS 301 responses, root/nested/download paths, repeated query parameters and encoded Turkish characters. The apex homepage still matches the verified static output after normalizing line endings; learning/legal pages and downloads return 200, and an unknown page returns 404. All 18 repository tests and the static build pass. Independent code review found no significant issues.
