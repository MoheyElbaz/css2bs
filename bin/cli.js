#!/usr/bin/env node
import { Command } from "commander";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { applyCssToBladeFiles, removeMappedStyles } from "../src/index.js";

const colors = {
  green: s => `\x1b[32m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan: s => `\x1b[36m${s}\x1b[0m`,
  dim: s => `\x1b[2m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`
};

const MODES = { PREVIEW: "preview", BRANCH: "branch", WRITE: "write" };

/**
 * A compact line-level diff. Only lines that differ are shown, with a little
 * context, which is enough to see what happened to a class attribute without
 * pulling in a diffing dependency.
 */
function printDiff(label, before, after) {
  const a = before.split("\n");
  const b = after.split("\n");
  const changed = [];

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) changed.push(i);
  }

  console.log(colors.bold(`\n  ${label}`));
  for (const i of changed.slice(0, 20)) {
    if (a[i] !== undefined) console.log(colors.red(`    - ${a[i].trim()}`));
    if (b[i] !== undefined) console.log(colors.green(`    + ${b[i].trim()}`));
  }
  if (changed.length > 20) {
    console.log(colors.dim(`    … ${changed.length - 20} more changed lines`));
  }
}

function git(args, cwd) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

/**
 * Move to a fresh branch so the edits land somewhere the user can throw away.
 * Refuses on a dirty tree, since committing or stashing on someone's behalf is
 * not this tool's job.
 */
function switchToNewBranch(cwd) {
  try {
    git(["rev-parse", "--is-inside-work-tree"], cwd);
  } catch {
    return { ok: false, reason: "not a git repository" };
  }

  if (git(["status", "--porcelain"], cwd) !== "") {
    return { ok: false, reason: "the working tree has uncommitted changes" };
  }

  const name = `css2bs/${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}`;
  git(["checkout", "-b", name], cwd);

  return { ok: true, name };
}

async function chooseMode(counts) {
  console.log(
    `\n  ${colors.bold(counts.blade)} Blade file${counts.blade === 1 ? "" : "s"} and ` +
    `${colors.bold(counts.css)} CSS file${counts.css === 1 ? "" : "s"} would change.\n`
  );
  console.log(`    ${colors.cyan("1")}  Preview only — show the changes, write nothing`);
  console.log(`    ${colors.cyan("2")}  Create a git branch, then apply`);
  console.log(`    ${colors.cyan("3")}  Apply to the working tree\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question("  Choose [1]: ")).trim() || "1";
    return { 1: MODES.PREVIEW, 2: MODES.BRANCH, 3: MODES.WRITE }[answer] ?? MODES.PREVIEW;
  } finally {
    rl.close();
  }
}

const program = new Command();
program
  .name("css2bs")
  .description("Scan a CSS file and update Blade files by appending Bootstrap 5 utility classes")
  .argument("<cssFile>", "CSS file to scan")
  .argument("<bladeDir>", "Directory containing Blade templates")
  .option("--dry-run", "show what would change and write nothing")
  .option("--write", "apply the changes to the working tree")
  .option("--branch [name]", "create a git branch, then apply the changes there")
  .version("0.2.0");

program.action(async (cssFile, bladeDir, opts) => {
  try {
    const cssPath = path.resolve(process.cwd(), cssFile);
    const bladeDirPath = path.resolve(process.cwd(), bladeDir);
    const css = fs.readFileSync(cssPath, "utf8");

    const { edits, map, existingClasses } = await applyCssToBladeFiles(css, bladeDirPath);

    if (!existingClasses || existingClasses.size === 0) {
      console.log(colors.yellow("No class attributes found in the Blade files — nothing to do."));
      return;
    }

    const { css: newCss, removedDecls, removedRules, originalLines, newLines } =
      removeMappedStyles(css, existingClasses);
    const cssChanged = newCss !== css;

    if (edits.length === 0 && !cssChanged) {
      console.log(colors.yellow("No changes to make."));
      return;
    }

    if (Object.keys(map || {}).length) {
      console.log(colors.bold("Class mappings:"));
      for (const [k, v] of Object.entries(map)) {
        console.log(`  ${colors.cyan(k)} => ${v}`);
      }
    }

    let mode = opts.dryRun ? MODES.PREVIEW
      : opts.branch ? MODES.BRANCH
        : opts.write ? MODES.WRITE
          : null;

    if (!mode) {
      // Without a flag and without a terminal to ask, previewing is the only
      // safe assumption — a pipe or a CI job did not consent to file edits.
      mode = process.stdin.isTTY
        ? await chooseMode({ blade: edits.length, css: cssChanged ? 1 : 0 })
        : MODES.PREVIEW;
    }

    if (mode === MODES.PREVIEW) {
      for (const e of edits) printDiff(path.relative(process.cwd(), e.file), e.before, e.after);
      if (cssChanged) printDiff(path.relative(process.cwd(), cssPath), css, newCss);
      console.log(colors.yellow(
        `\nPreview only — nothing was written. ` +
        `Re-run with --write to apply, or --branch to apply on a new git branch.`
      ));
      return;
    }

    if (mode === MODES.BRANCH) {
      const branch = switchToNewBranch(bladeDirPath);
      if (!branch.ok) {
        console.error(colors.red(`Cannot create a branch: ${branch.reason}.`));
        console.error(colors.yellow("Nothing was written. Commit or stash first, or use --write."));
        process.exit(1);
      }
      console.log(colors.green(`Switched to ${branch.name}`));
    }

    for (const e of edits) fs.writeFileSync(e.file, e.after);
    if (cssChanged) fs.writeFileSync(cssPath, newCss);

    console.log(colors.green(`Updated files: ${edits.length}`));
    for (const e of edits) console.log(` ${colors.cyan("•")} ${path.relative(process.cwd(), e.file)}`);
    console.log(colors.yellow(`Removed declarations: ${removedDecls}, removed empty rules: ${removedRules}`));
    console.log(colors.green(`CSS lines reduced: -${originalLines - newLines} (${originalLines} -> ${newLines})`));
  } catch (e) {
    console.error("css2bs error:", e.message);
    process.exit(1);
  }
});

program.parse();
