# Music controller

A built-in **Music** app shows what's playing on your PC — title, artist, and play state —
with big touch **transport controls** (play/pause, next, previous, stop), plus a programmable
**2×2 app-launcher grid** on the right (Spotify, YouTube Music, Apple Music, Tidal by default).
It's added on first run; like any app you can delete it (it stays gone) or add more via **+ App**.

- **Now-playing** is read from the Windows media flyout (System Media Transport Controls), so it's
  **app-agnostic** — and the transport buttons send standard media keys, controlling whatever's playing.
- **The 2×2 grid is a real, editable grid** — open the Music app in the [editor](editor.md) and program
  its tiles exactly like the Default/Media/Dev grids; each tile opens a URL in your PC browser or launches
  an app, same as any tile. (This is the "grid embedded in an app" capability — apps can carry their own grid.)
- **No admin, no extra software.**

## Compatibility

**Works with** anything that appears in the Windows media flyout — tested with Spotify, YouTube Music,
Music Assistant, Amazon Music, Tidal, Apple Music (web), SoundCloud, Bandcamp, and Plex (web). Browser
players generally "just work" via the browser's media-session integration. A few desktop apps don't
register with the flyout and so won't show now-playing or respond to the buttons (e.g. **VLC**, **Plexamp**).

*(Album art is a planned follow-up — the media-flyout thumbnail needs a small helper to extract.)*
