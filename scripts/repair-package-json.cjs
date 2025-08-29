const fs = require("fs");
const path = require("path");

const project = "C:\\\\McPlaner";
const pkgPath = path.join(project, "package.json");
const lockPath = path.join(project, "package-lock.json");

function readJSON(p){ return JSON.parse(fs.readFileSync(p, "utf8")); }
function writeJSON(p, obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", { encoding: "utf8" }); }

if(!fs.existsSync(lockPath)){ throw new Error("package-lock.json manjka — ne morem obnoviti package.json."); }

let lock;
try{ lock = readJSON(lockPath); } catch(e){ throw new Error("package-lock.json ni veljaven JSON: " + e.message); }

let root = null;
if(lock && lock.packages && Object.prototype.hasOwnProperty.call(lock.packages, "")){
  root = lock.packages[""];
} else {
  throw new Error("Lockfile ne vsebuje packages[''] (pričakovan npm lockfile v2+).");
}
if(!root){ throw new Error("V package-lock.json manjka root zapis packages['']."); }

const scripts = Object.assign({}, root.scripts || {});
if(!scripts.prebuild){ scripts.prebuild = 'node scripts/ui-freeze-check.cjs && node scripts/guard-no-direct-localstorage.cjs'; }
if(!scripts.build)   { scripts.build    = 'node "./node_modules/vite/bin/vite.js" build'; }
if(!scripts.dev)     { scripts.dev      = 'vite'; }

const deps = Object.assign({}, root.dependencies || {});
const devD = Object.assign({}, root.devDependencies || {});

const pkg = {
  name:    root.name    || "mcplaner",
  version: root.version || "2.0.0",
  private: typeof root.private === "boolean" ? root.private : true,
  type:    root.type    || "module",
  scripts,
  dependencies:    deps,
  devDependencies: devD
};

// Zakleni Tailwind config tudi v build skripti (Windows)
pkg.scripts.build = 'set TAILWIND_CONFIG=C:\\McPlaner\\tailwind.config.js&& ' + pkg.scripts.build;

writeJSON(pkgPath, pkg);
console.log("[repair] package.json obnovljen in zaklenjen (TAILWIND_CONFIG, type:module).");