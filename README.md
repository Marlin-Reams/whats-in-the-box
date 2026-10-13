# What's in the Box

A family inventory app for remembering what you packed and where you put it. React and Firebase power personal inventories, shared families, item photos, QR labels and search.

## What's changed

- Firestore document IDs stay stable after reload. Older stored UUIDs are recognized when resolving items and old in-app links.
- The dashboard searches loose and boxed items, boxes, notes and locations.
- Saves preserve input on failure and prevent duplicate submissions. Inventory subscriptions clear on account/scope changes.
- Box deletion locks new item destinations, then releases existing items and removes the box in one batch. Boxes over 450 items must be emptied before deletion.
- Hash-based QR links work on GitHub Pages. The 404 fallback handles older links inside the repository's URL prefix. Labels previously printed without that prefix must be reprinted.
- Individual accounts can create/join families using expiring codes. Owners can revoke invitations, remove members and restore access. Removed members cannot reuse old invitation codes to restore themselves.
- New photos load as authenticated Storage bytes. Family photos are copied into family storage rather than sharing personal download URLs.
- Family copying keeps personal originals intact and skips completed copies on retry. It may complete partially if a photo or document fails; retry after fixing the reported error. Already copied records are not overwritten.
- Shared forms, mobile layouts, native help dialogs and accessible labels replace duplicated implementations.

## Requirements

Node.js 22 or newer; Java 21 for emulator tests. Install packages with `npm ci`.

Copy `.env.example` to `.env.local` and fill in the public Firebase web configuration. Never commit private service-account files. `REACT_APP_ENABLE_FAMILIES=true` enables family controls only after the corresponding backend rules are ready.

For local testing use a `demo-` project ID and set `REACT_APP_USE_EMULATORS=true`. Start `npm run emulators`, then run `npm start` in another terminal. The app connects to Auth on 9099, Firestore on 8080, and Storage on 9199.

## Tests and builds

- `npm test -- --watchAll=false --runInBand`
- `npm run test:rules` starts isolated Firestore/Storage emulators and tests their rules.
- `npm run build` checks that a local emulator configuration cannot accidentally become a production build. Set `ALLOW_EMULATOR_BUILD=true` only when intentionally building a local emulator preview.

The Windows Codex sandbox required a temporary native-realpath workaround for Jest and an explicit Node executable when using Firebase's standalone binary. These workarounds are confined to the ignored `work/` directory; ordinary local terminals should not need them.

## Coordinated production release

1. Save/export the current rules and inventory. Keep a copy of the current deployed frontend for rollback.
2. Review and test `firestore.rules` and `storage.rules`. These preserve personal inventory while introducing membership-controlled family collections.
3. Deploy both rule files to the intended project. Storage's Firestore membership checks require the corresponding service integration permission when prompted by Firebase.
4. Apply `cors.json` to the actual Storage bucket so authenticated image-byte requests can be made from the deployed origin. Restrict origins to your actual app and development environment.
5. Build with the correct public production Firebase values, `REACT_APP_USE_EMULATORS=false`, and `REACT_APP_ENABLE_FAMILIES=true`. Review the built files, then publish them to GitHub Pages.
6. Verify create → reload → edit → move → delete, a second family member, outsider denial, member removal, images and direct QR links on the live site. Test camera scanning and printing on your actual phone and printer.
7. Reprint old malformed labels. Moving homes only changes box locations; new label IDs stay stable.

Stricter rules should not be published separately while old browser bundles are still in active use without considering compatibility. Legacy item edits using an old UUID destination will need the new app's ID normalization. Existing personal download-token URLs remain shareable; their old tokens are not revoked by these changes. New family photos use authenticated reads, and copies create new photo objects.

The repository includes Capacitor dependencies from the original project, but has no committed native Android configuration/project. This release targets the web app; a native Android package still requires separate setup and device testing.
