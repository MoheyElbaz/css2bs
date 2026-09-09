import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCssToBladeFiles, convertCssToBootstrap, removeMappedStyles } from "../src/index.js";
import { mapDeclToBs } from "../src/mappers.js";
import { withFixture } from "./helpers.js";

test("a user class containing fs- is not deleted", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box user-prefs-panel keep-me">x</div>',
    async ({ css, viewsDir }) => {
      const { edits } = await applyCssToBladeFiles(css, viewsDir);

      assert.match(edits[0].after, /user-prefs-panel/);
      assert.match(edits[0].after, /keep-me/);
    }
  );
});

test("a user class containing display- is not deleted", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box sidebar-display-toggle">x</div>',
    async ({ css, viewsDir }) => {
      const { edits } = await applyCssToBladeFiles(css, viewsDir);

      assert.match(edits[0].after, /sidebar-display-toggle/);
    }
  );
});

test("the author's class order is preserved and utilities are appended", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="alpha my-box beta">x</div>',
    async ({ css, viewsDir }) => {
      const { edits } = await applyCssToBladeFiles(css, viewsDir);
      const classes = edits[0].after.match(/class="([^"]*)"/)[1].split(" ");

      assert.deepEqual(classes.slice(0, 3), ["alpha", "my-box", "beta"]);
      assert.ok(classes.includes("p-3"));
    }
  );
});

test("real Bootstrap sizing utilities that conflict are still reduced", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box fs-2 display-1">x</div>',
    async ({ css, viewsDir }) => {
      const { edits } = await applyCssToBladeFiles(css, viewsDir);
      const classes = edits[0].after.match(/class="([^"]*)"/)[1].split(" ");

      assert.ok(classes.includes("display-1"), "display wins at the same breakpoint");
      assert.ok(!classes.includes("fs-2"), "the conflicting font-size is dropped");
    }
  );
});

test("Bootstrap component classes are left alone", async () => {
  await withFixture(
    ".card { padding: 1rem; }",
    '<div class="card">x</div>',
    async ({ css, viewsDir }) => {
      const { edits } = await applyCssToBladeFiles(css, viewsDir);

      assert.equal(edits.length, 0);
    }
  );
});

test("planning does not write to disk", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box">x</div>',
    async ({ css, viewsDir, bladeFile, readBlade }) => {
      const before = readBlade();
      await applyCssToBladeFiles(css, viewsDir);

      assert.equal(readBlade(), before, `${bladeFile} must be untouched by planning`);
    }
  );
});

test("removeMappedStyles handles a media query with a layout-critical property", () => {
  const css = "@media (min-width: 768px) {\n  .my-box { position: relative; }\n}\n";

  assert.doesNotThrow(() => removeMappedStyles(css, new Set(["my-box"])));
});

test("removeMappedStyles keeps layout-critical declarations", () => {
  const css = ".my-box { position: absolute; padding: 1rem; }\n";
  const { css: out } = removeMappedStyles(css, new Set(["my-box"]));

  assert.match(out, /position: absolute/);
  assert.doesNotMatch(out, /padding: 1rem/);
});

test("the spacing scale still maps as it did", () => {
  assert.equal(mapDeclToBs("padding", "1rem", null, ".x"), "p-3");
  assert.equal(mapDeclToBs("margin", ".5rem", null, ".x"), "m-2");
  assert.equal(mapDeclToBs("padding", "1rem", "md", ".x"), "p-md-3");
  assert.equal(mapDeclToBs("line-height", "1.5", null, ".x"), "lh-base");
});

test("convertCssToBootstrap reports the mapping as text", async () => {
  const { text } = await convertCssToBootstrap(".card { padding: 1rem; }", {});

  assert.match(text, /\.card\s+=>\s+p-3/);
});
