/** UI-FREEZE GUARD  preveri Tailwind vrstni red in prepove globalne resete. */
const fs = require("fs"), path = require("path");
function fail(m){ console.error("[ui-freeze] FAIL:", m); process.exit(1) }
function ok(m){ console.log("[ui-freeze] OK ", m) }
const root = "C:\\McPlaner";
const css = path.join(root, "src", "index.css");
if(!fs.existsSync(css)){ ok("index.css manjka  preskočim."); process.exit(0) }
const txt = fs.readFileSync(css,"utf8");
const iBase = txt.indexOf("@tailwind base");
const iComp = txt.indexOf("@tailwind components");
const iUtil = txt.indexOf("@tailwind utilities");
if(!(iBase>-1 && iComp>-1 && iUtil>-1)) fail("manjka @tailwind base/components/utilities");
if(!(iBase < iComp && iComp < iUtil)) fail("nepravilen vrstni red @tailwind direktiv");
if(/\* ?, ?\*::before ?, ?\*::after|html ?, ?body ?, ?\*|^\s*\*\s*\{[^}]*\}/m.test(txt)) fail("globalni CSS reset (prepovedan).");
ok("baseline preverjen.");