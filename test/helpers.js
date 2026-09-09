import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Build a throwaway css + Blade pair, run the callback against it, then remove it.
 */
export async function withFixture(css, blade, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "css2bs-"));
  const viewsDir = path.join(dir, "views");
  fs.mkdirSync(viewsDir);

  const cssFile = path.join(dir, "in.css");
  const bladeFile = path.join(viewsDir, "page.blade.php");
  fs.writeFileSync(cssFile, css);
  fs.writeFileSync(bladeFile, blade);

  try {
    return await fn({
      dir,
      css,
      cssFile,
      viewsDir,
      bladeFile,
      readBlade: () => fs.readFileSync(bladeFile, "utf8"),
      readCss: () => fs.readFileSync(cssFile, "utf8")
    });
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
