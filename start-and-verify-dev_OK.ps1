# ===================== McPlaner Ă˘â‚¬â€ť START + VERIFY + COLLABKIT SNAPSHOT =====================
param(
  [string]$Root   = "C:\McPlaner",
  [int]$VitePort1 = 3000,
  [int]$VitePort2 = 5173,
  [int]$ApiPort   = 8787,
  [string]$Domain = "mcplaner.jezek-oblacila.si",
  [switch]$Open,
  [int]$WaitSec  = 30,
  [switch]$Quick
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [Text.Encoding]::UTF8
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$PASS=0; $FAIL=0; $WARN=0
function P($m){ Write-Host "[dev] PASS: $m" -ForegroundColor Green }
function F($m){ Write-Host "[dev] FAIL: $m" -ForegroundColor Red }
function W($m){ Write-Host "[dev] WARN: $m" -ForegroundColor Yellow }
function I($m){ Write-Host "[dev] $m" -ForegroundColor Cyan }
function IncP(){ $script:PASS++ }
function IncF(){ $script:FAIL++ }
function IncW(){ $script:WARN++ }
function Test-Port([int]$port){ try { (Test-NetConnection -ComputerName "127.0.0.1" -Port $port -WarningAction SilentlyContinue).TcpTestSucceeded } catch { $false } }
function Wait-ForPort([int]$port,[int]$timeoutSec){ $t0=Get-Date; while((New-TimeSpan -Start $t0 -End (Get-Date)).TotalSeconds -lt $timeoutSec){ if(Test-Port $port){ return $true }; Start-Sleep -Milliseconds 300 }; return (Test-Port $port) }

# npm resolver
$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue).Source
if (-not $npmCmd -or -not (Test-Path $npmCmd)) {
  $probe = @("$env:ProgramFiles\nodejs\npm.cmd","$env:LOCALAPPDATA\Programs\nodejs\npm.cmd","$env:APPDATA\npm\npm.cmd") | Where-Object { Test-Path $_ }
  if ($probe.Count -gt 0) { $npmCmd = $probe[0] }
}
if ($npmCmd){ I ("npm.cmd: " + $npmCmd) } else { W "Ne najdem npm.cmd -> start preskocen"; IncW }

try {
  # ---------- 0) Paths ----------
  if (!(Test-Path $Root)){ F "Root ne obstaja: $Root"; IncF; break }
  P "Root obstaja: $Root"; IncP

  $Src = if (Test-Path (Join-Path $Root "src\frontend")) { Join-Path $Root "src\frontend" } elseif (Test-Path (Join-Path $Root "src")) { Join-Path $Root "src" } else { $null }
  if (-not $Src){ F "Ne najdem src ali src\frontend"; IncF; break }
  P "Src mapa: $Src"; IncP

  $pkg = Join-Path $Root "package.json"
  if (!(Test-Path $pkg)){ F "Manjka package.json"; IncF; break }
  try { $pkgJson = Get-Content $pkg -Raw | ConvertFrom-Json; P "Najden package.json"; IncP } catch { F "package.json ni veljaven"; IncF; break }

  $hasDev = ($pkgJson.scripts.dev -ne $null)
  $hasApi = ($pkgJson.scripts.api -ne $null)
  if (-not $hasDev){ W "scripts.dev manjka"; IncW } else { I ("scripts.dev = " + $pkgJson.scripts.dev) }
  if (-not $hasApi){ W "scripts.api manjka"; IncW } else { I ("scripts.api = " + $pkgJson.scripts.api) }

  # ---------- 1) Router / Tailwind ----------
  if (-not $Quick) {
    $routesRequired = @("/","/login","/dashboard","/week","/schedule","/floorplan","/employees","/hierarchy","/wishes/self","/wishes/team","/chat","/announcements","/reports","/settings","/ai")
    $codeFiles = Get-ChildItem -Path $Src -Recurse -File -Include *.js,*.jsx,*.ts,*.tsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "\\.vite\\" -and $_.FullName -notmatch "\\node_modules\\" }
    $content = ($codeFiles | ForEach-Object { Get-Content -Raw -Path $_.FullName }) -join "`n"
    $present=@(); $missing=@(); foreach($r in $routesRequired){ if($content -match [regex]::Escape($r)){ $present+=$r } else { $missing+=$r } }
    if ($present.Count){ P ("Prisotne rute: "+($present -join ", ")); IncP }
    if ($missing.Count){ W ("Manjkajoce rute: "+($missing -join ", ")); IncW }

    if (Test-Path (Join-Path $Root "tailwind.config.js")){ P "Najden Tailwind config"; IncP } else { W "Manjka tailwind.config.js"; IncW }
  }

  # ---------- 2) Start Vite & API ----------
  $VitePorts=@($VitePort1,$VitePort2)
  if ($npmCmd -and $hasDev){
    if (-not (Test-Port $VitePort1) -and -not (Test-Port $VitePort2)){
      I "Zaganjam Vite dev (novo okno)..."
      if (Test-Path (Join-Path $Src "package.json")) {
        $viteWorkDir = $Src
      } else {
        $viteWorkDir = $Root
      }
      $viteWorkDir = (Test-Path (Join-Path $Src "package.json")) ? $Src : $Root
      $cmdDev = "`"" + $npmCmd + "`" run dev"
      Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $cmdDev -WorkingDirectory $viteWorkDir -WindowStyle Normal | Out-Null
      if (-not $Quick){ $null = Wait-ForPort -port $VitePort1 -timeoutSec $WaitSec; $null = Wait-ForPort -port $VitePort2 -timeoutSec $WaitSec }
      if ((Test-Port $VitePort1) -or (Test-Port $VitePort2)) { P "Vite dev aktiven"; IncP } else { W "Vite ni gor"; IncW }
    } else { P "Vite ze tece"; IncP }
  }

  if ($npmCmd -and $hasApi){
    if (-not (Test-Port $ApiPort)){
      I "Zaganjam dev-api (novo okno)..."
      $cmdApi = "`"" + $npmCmd + "`" run api"
      Start-Process -FilePath "cmd.exe" -ArgumentList "/k", $cmdApi -WorkingDirectory $Root -WindowStyle Normal | Out-Null
      if (-not $Quick){ $null = Wait-ForPort -port $ApiPort -timeoutSec $WaitSec }
      if (Test-Port $ApiPort) { P "dev-api aktiven"; IncP } else { W "dev-api ni gor"; IncW }
    } else { P "dev-api ze tece"; IncP }
  }

  # ---------- 3) Browser ----------
  if ($Open){
    $url=$null; foreach($vp in $VitePorts){ if(Test-Port $vp){ $url=("http://localhost:{0}/" -f $vp); break } }
    if($url){ I ("Odpiram brskalnik: {0}" -f $url); Start-Process $url } else { W "Ni aktivnega Vite porta"; IncW }
  }

  # ---------- 4) CollabKit snapshot ----------
  $CollabPath = Join-Path $Root "collabkit-mcplaner.json"
  $collab = [ordered]@{
    project        = "McPlaner 2.0"
    root           = $Root
    src            = $Src
    vitePorts      = @($VitePort1,$VitePort2)
    apiPort        = $ApiPort
    domain         = $Domain
    routesRequired = @("/","/login","/dashboard","/week","/schedule","/floorplan","/employees","/hierarchy","/wishes/self","/wishes/team","/chat","/announcements","/reports","/settings","/ai")
    tailwindConfig = "tailwind.config.js"
    postcssConfig  = "postcss.config.*"
    apiRequired    = $false
    lastCheck      = (Get-Date).ToString("s")
  }
  $viteFile = Get-ChildItem -Path $Src -Recurse -File -Include vite.config.* -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($viteFile) {
    $vc = Get-Content -Raw -Path $viteFile.FullName
    if ($vc -match "localhost:8787") { $collab.apiRequired = $true }
  }
  $collabJson = ($collab | ConvertTo-Json -Depth 5 -Compress)
  [IO.File]::WriteAllText($CollabPath, $collabJson, (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "[collabkit] Datoteka osveÄąÄľena: $CollabPath" -ForegroundColor Cyan

} finally {
  Write-Host ""
  Write-Host "================ SUMMARY ================" -ForegroundColor Cyan
  Write-Host ("PASS: {0}   FAIL: {1}   WARN: {2}" -f $PASS,$FAIL,$WARN)
  if ($FAIL -gt 0){ Write-Host "STATUS: NEUSPEsNO" -ForegroundColor Red } else { Write-Host "STATUS: USPEsNO" -ForegroundColor Green }
  if (-not $Quick){ Read-Host "Pritisni Enter za zaprtje okna" }
}
