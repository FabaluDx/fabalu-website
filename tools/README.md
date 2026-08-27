# Project editor

`editor.html` is a local authoring tool for the site's project data. It is not part of
the site itself — nothing links to it and it carries `noindex`.

## Running it

It needs to be served over localhost (not opened as a `file://` page), because it reads
the repo's JSON and images over HTTP:

```bash
python -m http.server 5178
```

Then open <http://localhost:5178/tools/editor.html> and click **Open repo folder…**,
picking the site root (the folder containing `index.html`).

## What it does

- Edits `data/projects.json` — every card on the Projects page and the landing page.
- Edits `data/projects/<slug>.json` — the story pages (hero, subtitle, specs, gallery, body).
- Processes images on drop: thumbnails are cropped to exactly **640×360**, heroes are capped
  at 1600px wide, gallery images at 1400px, all re-encoded to JPEG. It warns when a source
  image is too small for the slot it is going into.
- Keeps `sitemap.xml` in sync with whichever projects have story pages.
- Maintains `homeOrder` automatically, so landing-page slots stay contiguous (1..N).

Saving writes straight into the working tree — review with `git diff` and commit as usual.

## Browser support

Direct file writing uses the File System Access API (Chrome / Edge). In Firefox and Safari
the editor still loads and edits, but **Save** downloads the changed files instead, and you
move them into place yourself.

## Notes

- Loading and saving a file unchanged produces no diff, with one exception: the first save
  of a story page removes the hand-added alignment spaces inside `gallery` entries. That is
  whitespace only — the data is untouched.
- Deleting a project removes it from `projects.json` but leaves its images and story JSON on
  disk, so nothing is lost by accident. Remove those by hand if you want them gone.
