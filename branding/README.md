# Branding

## `shotokan-tiger.png`

The **Shotokan tiger** ("Shotokan no Tora") — the white tiger in a red circle, the traditional
emblem of Shotokan karate. Extracted from the official exam program PDF
(`pdfs/PO-Shotokan-9Kyu-bis-8Dan.pdf`, page 1). This is the traditional Shotokan mark, **not** a
protected federation logo (e.g. the DKV corporate logo is deliberately not used).

## Regenerating the app icons

The PWA/app icons place the tiger emblem on a white circular badge (so its red circle never
clashes with the field) over the app's red brand field (`#b91c1c`), with a white **"SHOTOKAN"**
wordmark below.

```bash
python3 scripts/gen-icons.py
```

This regenerates, in `public/`:

- `pwa-192.png`, `pwa-512.png` — standard PWA icons (rounded corners)
- `pwa-512-maskable.png` — Android maskable (full-bleed red, content within the 80% safe zone)
- `apple-touch-icon.png` — iOS (180×180, opaque)
- `favicon.svg` — emblem-only (text is unreadable at 16px), red rounded square + white disc

Requires Python with **Pillow**.
