#!/usr/bin/env node
import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { applyCssToBladeFiles, removeMappedStyles } from "../src/index.js";
const colors = {
  green: s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan: s => `\x1b[36m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`
};

const program = new Command();
program
  .name("css2bs")
  .description("Scan a CSS file and update Blade files by appending Bootstrap 5 utility classes for spacing and line-height")
  .argument("<cssFile>", "CSS file to scan")
  .argument("<bladeDir>", "Directory containing Blade templates")
  .version("0.1.0");

program.action(async (cssFile, bladeDir, opts) => {
  try {
    const cssPath = path.resolve(process.cwd(), cssFile);
    const bladeDirPath = path.resolve(process.cwd(), bladeDir);
    const css = fs.readFileSync(cssPath, "utf8");
    const result = await applyCssToBladeFiles(css, bladeDirPath);
    const { updatedFiles, map, existingClasses } = result;

    console.log(colors.green(`Updated files: ${updatedFiles.length}`));
    for (const f of updatedFiles) console.log(` ${colors.cyan('•')} ${f}`);
    if (Object.keys(map || {}).length) {
      console.log(colors.bold("Class mappings:"));
      for (const [k, v] of Object.entries(map)) console.log(`  ${colors.cyan(k)} => ${v}`);
    }

    // Remove mapped styles from CSS and write back
    if (!existingClasses || existingClasses.size === 0) {
      console.log(colors.yellow("Warning: No existing classes found in Blade files"));
      return;
    }
    const { css: newCss, removedDecls, removedRules, originalLines, newLines } = removeMappedStyles(css, existingClasses);
    if (newCss !== css) {
      fs.writeFileSync(cssPath, newCss);
    }
    const delta = originalLines - newLines;
    console.log(colors.yellow(`Removed declarations: ${removedDecls}, removed empty rules: ${removedRules}`));
    console.log(colors.green(`CSS lines reduced: -${delta} (${originalLines} -> ${newLines})`));
  } catch (e) {
    console.error("css2bs error:", e.message);
    process.exit(1);
  }
});

program.parse();
