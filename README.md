# Product Catalog

A React + TypeScript single-page application for browsing a product catalog,
viewing product details and dashboard statistics. The project also includes
Firebase Authentication, Redux Toolkit state management and PWA offline support.

## Tech stack

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS + shadcn/ui-style components
- Firebase Authentication
- Redux Toolkit + React Redux
- DummyJSON API (`https://dummyjson.com`)

## Features

### Authentication

- Sign up with email and password.
- Sign in with email and password.
- Sign in with Google.
- Logout.
- Session persistence across page reloads via Firebase Authentication.
- Loading and error states for authentication actions.
- Protected `/profile` route that redirects unauthenticated users to `/login`
  and preserves the originally requested route.
- Profile page displaying the user's email and Firebase UID.
- Navigation that adapts to authentication state.

### Product catalog

- Product list with search, category/rating filters, sorting and pagination.
- Product details page with 404 handling.
- Dashboard with statistics and category breakdowns.
- Redux-backed loading, error, empty and retry states for catalog data.
- SPA redirects for Netlify (`public/_redirects`).

### PWA

- Installable app manifest with standard and maskable icons.
- Precached app shell and offline fallback page for navigation requests.
- Service worker update banner that lets users apply a waiting update.
- Runtime caching for public images/fonts and public product list/detail data.
- Strict exclusion of authenticated, credentialed, and non-public API requests
  from runtime API caching.
- Offline/online connection status and cached-data timestamp indicator.
- Responsive, touch-friendly layout and accessible mobile navigation.

### Caching

Catalog data is stored in Redux feature slices and fetched through typed hooks
and `createAsyncThunk`. The Redux store is the single source of truth for the
product list, product details and categories. `requestId` checks prevent an old
request from overwriting newer data, while thunk conditions avoid duplicate
requests during loading or after successful loads.

The browser Service Worker separately caches public product list/detail API
responses for offline use. `CachedDataBanner` reports when a response came
from that cache. Authenticated Firebase data and credentials are never stored
in the public API cache.

Search, filtering, sorting and pagination are applied client-side to the
Redux-backed product list. Their current values live in URL parameters so the
state is shareable and survives navigation. Search updates the URL immediately
because it does not create additional API requests.

### Redux Toolkit

The store is configured in `src/store/index.ts` and provided at the root in
`src/main.tsx`. Feature state is split by responsibility:

| Slice | Responsibility | Async work |
| --- | --- | --- |
| `auth` | Firebase session user and signup action state | `signupWithEmail` |
| `products` | Product list, status, errors and request identity | `fetchProducts` |
| `productDetails` | Current product, 404 state and request identity | `fetchProductDetails` |
| `categories` | Category list, status and errors | `fetchCategories` |

Each async thunk handles `pending`, `fulfilled` and `rejected` in
`extraReducers`. The `products`, `categories` and `productDetails` slices
track request IDs so stale responses cannot replace newer state.

Reusable selectors are defined next to their slices. Memoized selectors built
with `createSelector` derive filtered/sorted/paginated products, sorted
categories and authentication state. Components use `useAppSelector` and
`useAppDispatch` through feature hooks rather than accessing the store
directly.

Temporary form, menu, toast and submission state remains local to components.
Firebase tokens and auth persistence remain managed by Firebase; Redux stores
only the serializable session user and auth action state. `AuthContext` remains
as the UI-facing facade for Firebase login, Google sign-in, logout and signup.

The DummyJSON product API is read-only, so product create/update/delete
mutations are not available. The existing signup mutation updates the Redux
auth state after successful registration.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm

### Install

```bash
pnpm install
```

### Environment variables

Create a local `.env.local` file based on `.env.example` and fill in the values
from your Firebase Web App configuration:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Web App ID |

`.env.local` is ignored by Git. Never commit real credentials. The Firebase
web config is not a secret in the same way as a private key, but it should still
be provided through environment variables and not hardcoded in source files.

If any required variable is missing, the Firebase configuration module fails
fast with a descriptive error when the app starts.

### Firebase setup

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a Web App to the project.
3. Copy the Web App configuration values into `.env.local`.
4. Enable **Authentication → Sign-in method → Email/Password**.
5. Enable **Authentication → Sign-in method → Google**, provide a support email
   and configure the OAuth consent screen.
6. Add `localhost` and your production domain to
   **Authentication → Settings → Authorized domains**.

### Run

```bash
pnpm dev
```

Open the local URL printed by Vite.

### Build and test the PWA

The service worker is intentionally disabled during `pnpm dev`. Build and serve
the production bundle to test installability and offline behavior:

```bash
pnpm build
pnpm preview
```

Open the preview URL in a browser, then:

1. In DevTools → Application, verify the manifest and registered service worker.
2. Visit `/products` and a product detail page while online to populate public
   API cache entries.
3. Switch DevTools Network to Offline and reload those pages; cached data should
   render with its last-updated indicator.
4. Navigate to an uncached route offline to verify the offline fallback.
5. Use DevTools → Application → Service Workers to check for an update after a
   new deployment, then apply it through the in-app update banner.

## Caching strategy

Redux keeps the current catalog state in memory while the Service Worker caches
public network responses for offline use. The list request is fixed
(`https://dummyjson.com/products?limit=0`); search, filtering, sorting and
pagination are derived locally by selectors.

Each catalog thunk accepts an `AbortSignal` from Redux Toolkit. Slice
`requestId` checks ensure that a stale response cannot overwrite a newer
request. Failed list, category and detail requests expose Retry controls, and
the online reconnect handler repeats only Redux requests whose status is
`failed`.

The Service Worker applies expiration and entry limits to static assets and
public product API responses. Authenticated or credentialed requests are
excluded from runtime API caching. The app displays the cache timestamp through
`CachedDataBanner` when a public response was served offline.

### Mutations

The product API used by this project is read-only: there are no product create,
update or delete endpoints. Account creation is implemented as the
`signupWithEmail` thunk and updates the Redux auth state after Firebase accepts
the new account.

## Project structure

```text
src/
  components/       UI components, NavBar, ProtectedRoute
  config/           Firebase and app configuration
  contexts/         AuthContext and AuthProvider
  features/         Redux slices, async thunks and selectors
  hooks/            typed data/auth/PWA hooks
  lib/              auth form validation, formatting and shared utilities
  pages/            route pages including Login, Signup, Profile
  services/         product API and Firebase auth service
  store/            configureStore and typed Redux hooks
  pwa/              Service Worker registration and cache status
```

Authentication logic lives in `src/services/authService.ts` and
`src/contexts/AuthProvider.tsx`; UI components consume it through `useAuth`.
API requests live in `src/services`. Redux async orchestration and selectors
live in `src/features`; hooks adapt that state for pages and components.

## Scripts

- `pnpm dev` — start the development server
- `pnpm build` — type-check and build for production
- `pnpm preview` — preview the production build
- `pnpm lint` — run Oxlint

There is currently no automated test script configured in `package.json`.

## Deployment notes

- Provide all `VITE_FIREBASE_*` variables in the hosting provider's environment.
- Add the deployed domain to Firebase authorized domains.
- Build the app with `pnpm build` and publish the generated `dist` directory.
- No public deployment URL is configured or verified in this repository.
- Netlify deployment files are copied from `public/` during the Vite build:
  - `public/_redirects` provides the SPA fallback for all client routes.
  - `public/_headers` serves `sw.js` with `Cache-Control: no-cache`, so clients
    revalidate it instead of keeping an outdated worker script.
  - `public/_headers` also sets manifest content type/revalidation headers and
    allows the worker to control the root scope.
- The service worker registers at
  `import.meta.env.BASE_URL + 'sw.js'` with `import.meta.env.BASE_URL` as its
  scope in `src/pwa/registerServiceWorker.ts`, so deployments under a Vite base
  path remain correctly scoped.

## PWA implementation checklist

| Requirement | Implementation |
| --- | --- |
| Manifest | `index.html`, `public/manifest.webmanifest` |
| App icons | `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-512-maskable.png` |
| Service worker lifecycle | `src/pwa/registerServiceWorker.ts`, `src/sw.ts` |
| Update flow | `src/hooks/usePwaUpdate.ts`, `src/components/PwaUpdateBanner.tsx`, `src/sw.ts` |
| Runtime caching strategy: static assets | `src/sw.ts` |
| Runtime caching strategy: public product API | `src/sw.ts`, `src/services/service.ts` |
| Cache limits and expiry | `src/sw.ts` |
| Offline fallback page | `public/offline-fallback.html`, `src/sw.ts` |
| Online/offline indicator | `src/components/ConnectivityStatus.tsx`, `src/hooks/useOnlineStatus.ts` |
| Cached-data indicator | `src/components/CachedDataBanner.tsx`, `src/pwa/apiCacheStatus.ts`, `src/sw.ts` |
| Mobile layout and navigation | `src/index.css`, `src/components/NavBar.tsx`, `src/pages/ProductDetails.tsx`, `src/pages/Dashboard.tsx` |
