# API inventory

Audit date: 2026-11-10. Inventory is based on checked-in routes and service calls. Live provider calls were inaccessible from the web reader; response fields below are taken from the provider's published API docs, not a live response.

## Onuvuti Go API

All backend routes are registered in `backend/internal/routes/router.go`, under `/api/v1`. The Next.js rewrite forwards that prefix to the Go service. Unless marked admin/internal, public routes do not require auth. Route-level middleware protects the listed order, admin, and private inbox routes.

| Method and path | Purpose / inputs | Auth | Status |
| --- | --- | --- | --- |
| GET `/health` | Service/database health | Public | Implemented |
| POST `/auth/register`, `/auth/login`, `/auth/google`; GET `/auth/me` | User auth/profile | Token for `/me` | Implemented |
| GET `/stories`, `/stories/{slug}`, `/stories/track/{id}` | Published stories and read tracking | Public | Implemented |
| POST `/stories`, `/stories/{id}/react`, `/stories/{id}/comments` | Submit/react/comment | Public with validation/rate limits in handlers | Implemented |
| POST `/analytics/track` | Visit tracking | Public | Implemented |
| POST `/orders`; GET `/orders/trx/{trx}`, `/orders/{id}`; PATCH `/orders/{id}/paid`, `/orders/{id}/download` | Book order lifecycle | Internal secret or admin | Implemented |
| POST `/admin/login`; GET `/admin/dashboard`, `/admin/analytics`, `/admin/orders`, `/admin/users` | Admin login and dashboards | Login public; others admin | Implemented |
| PATCH `/admin/stories/{id}/approve`, `/admin/stories/{id}/pin`; POST `/admin/stories`; DELETE `/admin/stories/{id}`, `/admin/comments/{id}` | Story moderation | Admin | Implemented |
| GET `/ads`; GET `/admin/ads`; PUT/POST `/admin/ads/{slot}` | Ad slots | Admin for writes | Implemented |
| GET `/wellness`; GET/POST/PUT/DELETE `/admin/wellness[/{id}]` | Wellness content | Admin for writes | Implemented |
| GET `/polls/active`; POST `/polls/{id}/vote`; GET/POST/PUT/DELETE `/admin/polls[/{id}]` | Polls | Admin for management | Implemented |
| GET `/quotes/active`; POST `/quotes/{id}/react`; GET/POST/PUT/DELETE `/admin/quotes[/{id}]` | Quotes | Admin for management | Implemented |
| POST `/wishes`; GET `/wishes/{id}`, `/wishes/{id}/replies`; POST `/wishes/{id}/open`, `/wishes/{id}/replies` | Birthday wishes | Public | Implemented |
| GET/DELETE `/admin/wishes[/{id}]` | Wish moderation | Internal/admin | Implemented |
| POST `/secret/inboxes`; GET `/secret/inboxes/{username}`; POST `/secret/inboxes/{username}/messages`; GET `/secret/inboxes/{username}/inbox`; POST `/secret/inboxes/{username}/messages/{id}/reply`; DELETE `/secret/inboxes/{username}/messages/{id}` | Anonymous inbox and replies | Handler validates private operations | Implemented |
| GET `/admin/secret/stats` | Inbox stats | Internal/admin | Implemented |
| GET `/meta/config`; POST `/meta/events` | Public analytics config/event ingestion | Public | Implemented |
| GET/PUT `/admin/meta/config`; GET `/admin/meta/events`, `/admin/meta/analytics`; POST `/admin/meta/test-capi` | Meta admin integration | Admin | Implemented |
| GET `/adult/videos` | Proxies search query, page, per_page (max 48), sort, and category slugs to AdultEmbed `/search`; response is provider JSON (`count`, pagination, `results`) | Public; adult UI gates access | Implemented; 10-minute in-memory cache, 8-second upstream timeout |
| GET `/adult/categories` | Proxies AdultEmbed category list | Public; adult UI gates access | Implemented; 10-minute in-memory cache |

Error handling for the adult proxy returns HTTP 502 with a localized error object for timeout/provider failure or malformed JSON. The proxy currently forwards upstream JSON fields without a strongly typed Go response model.

## Next.js route handlers

| Method and path | Purpose / upstream | Auth / errors | Status |
| --- | --- | --- | --- |
| POST `/api/stories/submit` | Validates and proxies story submission to Go; local fallback response exists if Go is unavailable | IP rate limit, honeypot, input sanitization | Implemented |
| GET `/api/admin/analytics` | Proxies Go admin analytics | Admin token; upstream failure handled | Implemented |
| POST `/api/admin/auth` | Admin auth forwarding | Credential validation in backend | Implemented |
| GET/POST `/api/v1/wishes` | Wish forwarding | Request errors returned | Implemented |
| GET/DELETE `/api/v1/admin/wishes[/{id}]` | Admin wish forwarding | Internal secret/token | Implemented |
| GET `/api/admin/ebook` and GET `/api/download` | E-book access/download | Token/order checks | Implemented |
| POST `/api/payment/create`, `/verify`, `/verify-trx`, `/webhook`, `/cancel` | Payment provider flow | Provider and order validation | Implemented |

## AdultEmbed API discovery

The official docs describe versioned public routes at `https://adultembed.com/api/v1/`. Published capabilities include:

| Provider endpoint | Documented inputs / response | Adult integration status |
| --- | --- | --- |
| GET `/search` | `query`, category/tag/performer/studio filters, duration, quality, sort, page, `per_page`; response includes `count`, pagination and `results` with metadata and `embed.url` | Integrated for query, category, sort and pagination |
| GET `/videos/{video_id}` | Integer provider ID; one video and embed metadata | Not yet integrated |
| GET `/videos/{video_id}/related` | Integer ID and `limit` | Not yet integrated |
| GET `/videos/trending` | `period` plus search filters, page and `per_page` | Not yet integrated; popularity is exposed through `/search?sort=popular` |
| GET `/categories` | Optional query/sort/page/per_page; taxonomy results | Integrated for list display; category query is passed to `/search` |
| GET `/tags` | Optional query/sort/page/per_page; taxonomy results | Not yet integrated |
| GET `/suggest` | `q` (minimum two characters), `limit` | Not yet integrated |
| GET `/videos/{video_id}/status`, `/videos/removed` | Status/removal sync | Not yet integrated |
| GET `/performers`, `/performers/{slug}`, `/performers/find`, `/performers/attributes` | Performer directory/profile/search | Out of current design scope |
| GET `/studios` | Studio directory | Out of current design scope |
| GET `/videos` | Comma-separated IDs, up to 100 | Not yet integrated |
| GET `/categories/{slug}` | One category | Not yet integrated |

The provider documents `https://adultembed.com/player/embed/{video_id}/` as a player URL. Its unversioned database browse/taxonomy APIs are documented separately; they are not called by this implementation. The API's live JSON could not be fetched with the available web reader, so it has not been runtime-verified here.
