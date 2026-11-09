# Adult section design plan

## Direction

Give `/adult` its own visual system instead of borrowing the main site's crimson/gold palette. Use a calm midnight-green base (`#101917`), layered forest surfaces, sage accents (`#b7c9a2`), and a restrained muted-gold detail (`#c6ad76`). Use the existing Bengali font with a more editorial scale and quieter labels.

## Experience

- A compact sticky navigation with responsive mobile menu and a clear way back to the main site.
- A cinematic but image-free hero built from CSS shapes, typography, and quiet gradients.
- Search, sort controls, live category chips, a responsive video grid and pagination.
- Blur provider thumbnails in the catalog, with restrained reveal on hover/focus, to avoid explicit promotional previews.
- Clear skeleton, empty and retry states; video player and story reader use focused modal layouts.
- Preserve the existing 18+ acknowledgement and story reader while avoiding unsupported privacy claims.
- Include visible keyboard focus and reduce motion when the visitor requests it.

## Implemented

The CSS tokens and page redesign are implemented in `src/app/adult/adult.css` and `src/app/adult/page.tsx`. The backend search proxy now accepts validated category slugs. Additional detail, related-video, tag/suggestion and report flows remain follow-up implementation work.
