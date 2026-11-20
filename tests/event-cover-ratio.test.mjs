import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const build = fs.readFileSync("build.mjs", "utf8");
const style = fs.readFileSync("public/assets/cinematic.css", "utf8");
const gallery = fs.readFileSync("public/assets/gallery.css", "utf8");

test("event covers display whole image and have full-size lightbox action", () => {
  assert.match(build, /show-art--photo/);
  assert.match(build, /show-cover-open/);
  assert.match(build, /data-osc-image/);
  assert.match(style, /\.show-art--photo \.show-photo\s*\{[\s\S]*?object-fit:contain/);
  assert.match(style, /\.show-card:hover \.show-art--photo \.show-photo\{transform:none/);
});
test("event album thumbnails do not crop uploaded photos", () => {
  assert.match(gallery, /\.event-gallery-image\{object-fit:contain/);
});
