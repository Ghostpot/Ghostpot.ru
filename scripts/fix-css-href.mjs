import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const assetsDir = ".output/public/assets";
const css = readdirSync(assetsDir).filter((name) => /^styles-.*\.css$/.test(name));
if (css.length !== 1) {
  console.error("expected one styles-*.css, got", css);
  process.exit(1);
}
const href = `/assets/${css[0]}`;
let files = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
      continue;
    }
    if (!/\.(mjs|js|html|json)$/.test(name)) continue;
    const text = readFileSync(path, "utf8");
    const next = text.replace(/\/assets\/styles-[A-Za-z0-9_-]+\.css/g, href);
    if (next !== text) {
      writeFileSync(path, next);
      files += 1;
    }
  }
}

walk(".output/server");
console.log(`css href ${href} in ${files} files`);
