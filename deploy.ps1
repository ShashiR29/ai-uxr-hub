
Add suggest form and README
# deploy.ps1 — push local changes to GitHub Pages
# Usage: right-click this file → "Run with PowerShell"
# Or in terminal: .\deploy.ps1
# Uses HTTPS remote (personal) with stored credentials.

Set-Location $PSScriptRoot
git add -A
$msg = Read-Host "Commit message (press Enter for default)"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = "Update site" }
git commit -m $msg
git push personal master
git push personal master:gh-pages

Write-Host "`n✓ Deployed to https://shashir29.github.io/ai-uxr-hub/" -ForegroundColor Green
Write-Host "  Changes will be live in ~1 minute." -ForegroundColor Cyan

