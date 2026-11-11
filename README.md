# Product Catalog

A React + TypeScript single-page application for browsing a product catalog,
viewing product details and dashboard statistics. The project also includes
Firebase Authentication and cached server data with TanStack Query.

## Tech stack

- React 19 + TypeScript
- Vite
- React Router
- Tailwind CSS + shadcn/ui-style components
- Firebase Authentication
- TanStack Query
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
- SPA redirects for Netlify (`public/_redirects`).

### Caching

Server data is fetched through TanStack Query hooks, not directly from UI
components. `useProducts` and `useProduct` cache product data, and
`useCategories` caches the category list used by filters.

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

## Caching strategy

TanStack Query is configured in `src/config/queryClient.ts`:

- `staleTime: 60_000` — data is considered fresh for 1 minute. Fresh cached
  data is served without a network request.
- `gcTime: 5 * 60_000` — unused query data is garbage-collected after 5 minutes.
- `retry: 2` — failed GET requests are retried twice with exponential backoff.

Product details use a custom retry policy that does not retry `404` responses,
so an invalid product is reported immediately.

Query keys are defined in `src/lib/queryKeys.ts`:

```ts
queryKeys.products.all          // ['products']
queryKeys.products.list()       // ['products', 'list']
queryKeys.products.detail(id)   // ['products', 'detail', String(id)]
queryKeys.categories.all        // ['categories']
queryKeys.categories.list()     // ['categories', 'list']
```

List and detail queries are separated, so different products never share a
cache entry. The product list request is fixed (`/products?limit=0`); search,
filtering, sorting and pagination are applied client-side to the cached list,
so they do not require separate query keys.

Query functions receive TanStack Query's `AbortSignal` and pass it to the API
client. When a query key changes or a component unmounts, the stale request is
aborted and cannot overwrite newer results.

### Expiration and revalidation

After `staleTime` expires, cached data is revalidated in the background while
the previous data stays visible. Revalidation also happens on window focus when
the data is stale. A manual refetch is triggered by the existing Retry buttons
through each hook's `refetch`.

### Cache invalidation

The product API used by this project is read-only: there are no create, update
or delete operations for products, and no mutations are implemented. Therefore
there is currently no cache invalidation after mutations.

If write operations are added later, invalidate the relevant resource after a
successful mutation, for example:

```ts
queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
queryClient.invalidateQueries({ queryKey: queryKeys.categories.all })
```

## Project structure

```text
src/
  components/       UI components, NavBar, ProtectedRoute
  config/           Firebase and TanStack Query configuration
  contexts/         AuthContext and AuthProvider
  hooks/            useAuth, useProducts, useProduct, useCategories
  lib/              query keys, auth form validation, formatting
  pages/            route pages including Login, Signup, Profile
  services/         product API and Firebase auth service
```

Authentication logic lives in `src/services/authService.ts` and
`src/contexts/AuthProvider.tsx`; UI components consume it through `useAuth`.
API and caching logic live in `src/services`, `src/hooks` and
`src/lib/queryKeys.ts`.

## Scripts

- `pnpm dev` — start the development server
- `pnpm build` — type-check and build for production
- `pnpm preview` — preview the production build
- `pnpm lint` — run Oxlint

## Deployment notes

- Provide all `VITE_FIREBASE_*` variables in the hosting provider's environment.
- Add the deployed domain to Firebase authorized domains.
- `public/_redirects` contains the SPA fallback required by Netlify.
