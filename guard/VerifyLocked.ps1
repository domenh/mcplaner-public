param([switch]$Quiet)

$ROOT = "C:\McPlaner"
$MANI = Join-Path $ROOT "guard\manifest.json"
if(!(Test-Path $MANI)){ Write-Error "Manjka manifest: $MANI"; exit 2 }

$manifest = Get-Content $MANI -Raw | ConvertFrom-Json
$failed = @()

foreach($m in $manifest){
  $full = Join-Path $ROOT $m.path
  if(!(Test-Path $full)){ $failed += "MISSING: $($m.path)"; continue }
  $cur = (Get-FileHash $full -Algorithm SHA256).Hash
  if($cur -ne $m.sha256){ $failed += "CHANGED: $($m.path)" }
}

if($failed.Count -gt 0){
  if(-not $Quiet){
    Write-Host "⚠️  Spremembe zaklenjenih datotek:" -ForegroundColor Yellow
    $failed | ForEach-Object { Write-Host " - $_" -ForegroundColor Yellow }
    Write-Host "↩️  Če si spremembe res želel, posodobi baseline z:" -ForegroundColor Yellow
    Write-Host "    PowerShell:  C:\McPlaner\guard\UpdateBaseline.ps1" -ForegroundColor Yellow
  }
  exit 1
}else{
  if(-not $Quiet){ Write-Host "✅ Locked datoteke so nespremenjene." -ForegroundColor Green }
  exit 0
}