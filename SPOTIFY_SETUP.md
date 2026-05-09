# Spotify "Now playing" widget — one-time setup

The floating widget in the bottom-right of every page is wired up but
**dormant** until you do this once. ~5 minutes total.

## 1. Create a Spotify Developer app (free)

- Go to https://developer.spotify.com/dashboard → **Log in** with your
  personal Spotify account → **Create app**.
- Name: anything (e.g. *Manoj's Blog Now Playing*).
- Description: anything.
- **Redirect URI:** `https://manojponugoti64.github.io/spotify-callback.html`
  (the URI doesn't need to actually serve anything — Spotify only checks
  it matches during the OAuth handshake).
- Which API/SDKs are you planning to use? **Web API**.
- Save → click into the app → **Settings** → copy the **Client ID** and
  click **View client secret** to copy the **Client Secret**.

## 2. Get a refresh token (one-time)

You need a long-lived refresh token so the GitHub Action can keep getting
fresh access tokens without you logging in again. Easiest path:

- Open the community helper: https://alecchen.dev/spotify-refresh-token/
- Paste your **Client ID** and **Client Secret**.
- Add scope: `user-read-currently-playing` (and `user-read-playback-state`
  if you want pause/skip status too).
- Click **Submit** → it bounces you through Spotify's auth page → comes
  back with a **Refresh Token**. Copy that.

Alternatively, run a tiny local script — any community
"spotify-refresh-token-cli" works the same way.

## 3. Add three secrets to the repo

Go to https://github.com/Manojponugoti64/manojponugoti64.github.io/settings/secrets/actions
and click **New repository secret** three times:

| Name                       | Value                          |
|----------------------------|--------------------------------|
| `SPOTIFY_CLIENT_ID`        | from step 1                    |
| `SPOTIFY_CLIENT_SECRET`    | from step 1                    |
| `SPOTIFY_REFRESH_TOKEN`    | from step 2                    |

## 4. Trigger the first run

Go to **Actions** tab → **Spotify now-playing** → **Run workflow** → pick
`main` → **Run workflow**. After ~30 seconds, `now-playing.json` at the
repo root should be updated with whatever you're listening to.

After that, the workflow runs every 5 minutes on its own. The widget on
your live site will fade in within a minute of you starting playback and
fade out once nothing's playing.

## Notes

- The widget reads `/now-playing.json` directly from the live site, so
  there's no auth or rate-limit issue on visitors' side.
- Tokens stay in GitHub Actions secrets and never reach the browser.
- If you ever want to disable: just delete the three secrets — the
  workflow will still run every 5 min but won't update the JSON, and the
  widget will hide itself within one polling cycle.
- Visitors can dismiss the widget for the session via the × in the corner
  (sessionStorage gate, no cookies).
