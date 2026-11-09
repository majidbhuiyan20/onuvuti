# Adult platform implementation plan

## Existing architecture

The repository already contains a Next.js App Router frontend, Go standard-library API server, PostgreSQL migrations and a rewrite from `/api/v1/*` to Go. The live adult catalog was not in PostgreSQL. The backend's current SQL driver is `lib/pq`, rather than the requested pgx. Keep the working architecture in place; a driver or schema migration should be planned separately.

## Delivery steps

1. Audit routes, API surface, database, auth and adult UI. **Done:** audit notes are in `WEBSITE_AUDIT.md` and `API_INVENTORY.md`; the design direction is in `DESIGN_PLAN.md`.
2. AdultEmbed discovery and integration. **Partial:** documented `/search` and `/categories` are proxied with timeout, response validation and cache; the provider's live JSON endpoint could not be reached by the available web reader. Search/category filters are integrated into the new page.
3. Premium responsive redesign. **Done for `/adult`:** independent tokens, hero, navigation, categories, catalog cards, reader/player modals, loading/empty/error states and responsive layouts.
4. Expand the API layer with typed mapping, trending/details/related/tags, retries for transient failures and provider-backed tests. **Remaining.**
5. Add persistent catalog sync and database schema only after confirming the provider licensing and desired curation workflow. **Remaining.**
6. Add favorites, history, reports, admin curation, and stronger age/access policy. **Remaining.**
7. Add route metadata, structured data where appropriate, security headers, browser-level responsive review and production integration checks. **Remaining.**

## Verification in this increment

After implementation run Go tests, TypeScript checking, focused ESLint, and diff whitespace checks. Do not report the provider as live-tested because the external JSON endpoint was not reachable through the available reader.
