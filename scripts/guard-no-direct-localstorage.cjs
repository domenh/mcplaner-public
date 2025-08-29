/** GUARD — prepovej direkten localStorage iz komponent.
 *  OPOMBA: ignoriramo legacy kodo v src/frontend/** (ne mešamo stare verzije).
 */
const fs = require("fs");
const path = require("path");
const root = "C:\\McPlaner";
const SRC  = path.join(root,"src");
const LEGACY_IGNORE = path.join(SRC, "frontend"); // celotno poddrevo ignoriramo

const allow = new Set([path.join(root,"src","model","storage.js").toLowerCase()]);
let bad = [];

function shouldIgnore(p){
  const lower = p.toLowerCase();
  // ignoriraj node_modules/dist/build/.git in celo poddrevo src/frontend/**
  if(lower.includes("\\node_modules\\") || lower.includes("\\dist\\") || lower.includes("\\build\\") || lower.includes("\\.git\\"))
    return true;
  if(lower.startsWith(LEGACY_IGNORE.toLowerCase())) return true;
  return false;
}

function scan(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    const p = path.join(dir, ent.name);
    if(shouldIgnore(p)) continue;

    if(ent.isDirectory()){
      scan(p);
    } else if(/\.(jsx?|tsx?)$/i.test(ent.name)){
      const lower = p.toLowerCase();
      const txt = fs.readFileSync(p, "utf8");
      // prepovej write/removal; read (getItem) toleriramo pri migracijah, a ga je priporočljivo odstraniti v aktivni kodi
      if(/localStorage\s*\.(setItem|removeItem)\s*\(/.test(txt) && !allow.has(lower)){
        bad.push(p);
      }
    }
  }
}

if(fs.existsSync(SRC)) scan(SRC);

if(bad.length){
  console.error("[guard-localStorage] FAIL: neposreden localStorage v naslednjih datotekah:");
  for(const f of bad){ console.error(" -", f) }
  process.exit(1);
} else {
  console.log("[guard-localStorage] OK — ni neposrednega localStorage pisanja iz AKTIVNE kode (legacy src/frontend/** je ignoriran).");
}