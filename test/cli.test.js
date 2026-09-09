import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { withFixture } from "./helpers.js";

const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "cli.js");

function run(args) {
  return execFileSync("node", [cli, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

test("--dry-run writes nothing", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box">x</div>',
    async ({ cssFile, viewsDir, readBlade, readCss }) => {
      const blade = readBlade();
      const css = readCss();

      const out = run([cssFile, viewsDir, "--dry-run"]);

      assert.match(out, /Preview only/);
      assert.equal(readBlade(), blade, "the Blade file must be untouched");
      assert.equal(readCss(), css, "the CSS file must be untouched");
    }
  );
});

test("without a flag and without a terminal, it previews rather than writing", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box">x</div>',
    async ({ cssFile, viewsDir, readBlade }) => {
      const blade = readBlade();

      run([cssFile, viewsDir]);

      assert.equal(readBlade(), blade);
    }
  );
});

test("--write applies the change and keeps the author's classes", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box user-prefs-panel keep-me">x</div>',
    async ({ cssFile, viewsDir, readBlade }) => {
      run([cssFile, viewsDir, "--write"]);

      const after = readBlade();
      assert.match(after, /user-prefs-panel/);
      assert.match(after, /keep-me/);
      assert.match(after, /p-3/);
    }
  );
});

test("--branch refuses outside a git repository and writes nothing", async () => {
  await withFixture(
    ".my-box { padding: 1rem; }",
    '<div class="my-box">x</div>',
    async ({ cssFile, viewsDir, readBlade }) => {
      const blade = readBlade();

      assert.throws(
        () => run([cssFile, viewsDir, "--branch"]),
        err => {
          assert.match(String(err.stderr), /not a git repository/);
          return true;
        }
      );

      assert.equal(readBlade(), blade);
    }
  );
});
