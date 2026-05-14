# Frontend-only deployment

This folder can be deployed as a static Vite/React app.

## Recommended quick option: Netlify

1. Push the project to GitHub.
2. In Netlify, choose **Add new site** -> **Import an existing project**.
3. Select this repo.
4. Set the base directory to:

   ```text
   frontend
   ```

5. Netlify will use `netlify.toml`:

   ```text
   Build command: npm run build
   Publish directory: dist
   ```

6. Deploy, then share the Netlify URL with testers.

## Vercel option

1. Push the project to GitHub.
2. Import the repo in Vercel.
3. Set the root directory to:

   ```text
   frontend
   ```

4. Vercel will use `vercel.json`.
5. Deploy, then share the Vercel URL with testers.

## What works without the backend

The onboarding flow can still open the app if the backend is not reachable. Frontend/local features such as habits, milestones, reflections, and profile-style flows can be tested in the browser.

Backend-powered features such as real mentor matching, role switching, requests, admin queues, and persisted accounts need the FastAPI backend later.
