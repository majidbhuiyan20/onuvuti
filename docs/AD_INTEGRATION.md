# Adult section advertising

Ad slots are configured centrally in `src/components/adult/AdUnits.tsx` and only mount after the visitor passes the 18+ acknowledgement.

## Active placements

- Desktop: 468×60 below navigation; 160×300 right of the catalog on wide screens; 300×250 after the first six results; one native slot below stories. Video pages also show a sidebar banner, a banner below video details, and a native slot after related videos.
- Mobile: 320×50 below navigation; 300×250 in the catalog after six results; one native slot below stories. Video pages use the mobile banner above the player and place the related native slot below the related-video list.
- Banner requests are near-viewport lazy loaded, use a serialized queue for Adsterra's global `atOptions`, and time out after 10 seconds. The native snippet is mounted once in the single native slot. Failed script requests hide the slot.

## Additional units

- `bicea.org/14/...` is enabled after the visitor's first pointer or keyboard interaction, and at most once per tab. This is an Adsterra Popunder format that can open a new tab. Adsterra's publisher guidance says to place Popunder code in `<head>`; this loader appends it to the document head after interaction. Confirm the domain/unit is approved in the publisher account before production use.
- `afders.org/1/...` is not an Adsterra host and could not be inspected. Public domain records describe `afders.org` as part of the BPGame interactive engagement network and show it was registered recently. It remains disabled. Do not enable it until its vendor, behavior, content eligibility and consent requirements have been confirmed.
- The supplied native tag appeared twice with the same container ID. It is installed once to avoid duplicate IDs/scripts.

The external ad scripts and live creative delivery could not be verified from this workspace. Check the publisher dashboard for approved site/unit status and adult-content eligibility before production rollout.
