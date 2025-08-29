$ErrorActionPreference="Stop"
$ROOT = "C:\McPlaner"
$MANI = Join-Path $ROOT "guard\manifest.json"
$BAS  = Join-Path $ROOT "guard\baseline"
$manifest = Get-Content $MANI -Raw | ConvertFrom-Json
foreach($m in $manifest){
  $full = Join-Path $ROOT $m.path
  if(!(Test-Path $full)){ throw "Manjka: $($m.path)" }
  $dst = Join-Path $BAS ($m.path -replace "[\\/:]","__")
  Copy-Item $full $dst -Force
  $m.sha256 = (Get-FileHash $full -Algorithm SHA256).Hash
  $m.baseline = $dst
}
$manifest | ConvertTo-Json -Depth 3 | Set-Content -Path $MANI -Encoding UTF8
Write-Host "✅ Baseline posodobljen." -ForegroundColor Green