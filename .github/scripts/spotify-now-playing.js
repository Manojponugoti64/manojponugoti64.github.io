#!/usr/bin/env node
/* Refresh /now-playing.json with whatever the linked Spotify account is
 * currently playing. Designed to run from the spotify-now-playing.yml
 * workflow on a 5-minute cron.
 *
 * Reads three env vars:
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 *
 * Writes the JSON file to <repoRoot>/now-playing.json. Always emits a
 * well-formed file — when nothing's playing it sets isPlaying=false so the
 * widget hides itself client-side.
 */
'use strict';

const fs = require('fs');
const path = require('path');

async function getAccessToken() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!id || !secret || !refresh) {
    throw new Error('Missing Spotify env vars');
  }
  const auth = Buffer.from(id + ':' + secret).toString('base64');
  const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh });
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + auth,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('Token refresh failed: ' + res.status + ' ' + txt);
  }
  const json = await res.json();
  return json.access_token;
}

async function getCurrentlyPlaying(token) {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: 'Bearer ' + token }
  });
  if (res.status === 204 || res.status === 202) return null;
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error('currently-playing failed: ' + res.status + ' ' + txt);
  }
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

function pickAlbumArt(images) {
  if (!Array.isArray(images) || !images.length) return null;
  // Prefer a mid-sized image (~300px) for a small widget; fall back to first.
  const mid = images.find((i) => i && i.width && i.width >= 200 && i.width <= 400);
  return (mid || images[0]).url;
}

function buildPayload(api) {
  if (!api || !api.is_playing || !api.item) {
    return {
      isPlaying: false,
      title: null,
      artist: null,
      album: null,
      albumImageUrl: null,
      songUrl: null
    };
  }
  const item = api.item;
  return {
    isPlaying: true,
    title: item.name || null,
    artist: (item.artists || []).map((a) => a.name).filter(Boolean).join(', ') || null,
    album: (item.album && item.album.name) || null,
    albumImageUrl: item.album && pickAlbumArt(item.album.images),
    songUrl: (item.external_urls && item.external_urls.spotify) || null
  };
}

// Whether two payloads differ in any field that actually matters to the
// widget. updatedAt is intentionally excluded — see main() for the
// rationale (the workflow's `git diff --quiet` guard would otherwise
// commit every 5 minutes even when nothing's playing).
function meaningfulDiff(prev, next) {
  if (!prev) return true;
  const keys = ['isPlaying', 'title', 'artist', 'album', 'albumImageUrl', 'songUrl'];
  return keys.some((k) => prev[k] !== next[k]);
}

function readExisting(out) {
  try { return JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { return null; }
}

(async function main() {
  try {
    const token = await getAccessToken();
    const api = await getCurrentlyPlaying(token);
    const next = buildPayload(api);
    const out = path.resolve(__dirname, '..', '..', 'now-playing.json');
    const prev = readExisting(out);
    if (!meaningfulDiff(prev, next)) {
      // Nothing changed — leave the file alone. The workflow's git diff
      // check will short-circuit and skip the commit.
      console.log('no change, isPlaying=', next.isPlaying, 'title=', next.title);
      return;
    }
    // Only stamp updatedAt when the meaningful payload actually changed,
    // so it doubles as a "last change" marker rather than churning every
    // run.
    const payload = Object.assign({}, next, { updatedAt: new Date().toISOString() });
    fs.writeFileSync(out, JSON.stringify(payload, null, 2) + '\n');
    console.log('wrote', out, 'isPlaying=', payload.isPlaying, 'title=', payload.title);
  } catch (err) {
    console.error('spotify-now-playing failed:', err && err.message);
    // Don't crash the workflow on transient Spotify failures — leave the
    // file as-is so the last known good state stays visible to readers.
    process.exit(0);
  }
})();
