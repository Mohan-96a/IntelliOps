# Run in PowerShell OUTSIDE Cursor (not Cursor terminal):
#   powershell -ExecutionPolicy Bypass -File .\scripts\fix-cursor-coauthor.ps1

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git not found in PATH. Open Git Bash or install Git for Windows."
}

$badCommit = (git log -1 --pretty=format:%B 2>&1) -join "`n"
if ([string]::IsNullOrWhiteSpace($badCommit)) {
  Write-Error "Could not read commit message. Is this a git repo?"
}

Write-Host "Current commit message:"
Write-Host $badCommit
Write-Host ""

if ($badCommit -notmatch "cursoragent@cursor\.com") {
  Write-Host "No Cursor co-author in latest commit."
  Write-Host "If GitHub still shows Cursor, you may need: git push --force origin main"
  Write-Host "Or wait 10-30 minutes for GitHub to refresh contributors."
  exit 0
}

Write-Host "Rewriting latest commit without Cursor co-author..."

$tree   = (git rev-parse "HEAD^{tree}").Trim()
$parent = (git rev-parse "HEAD^").Trim()
$msgPath = Join-Path ".git" "fix-msg.txt"
"Fix shared package exports so microservices start correctly" | Out-File -Encoding utf8NoBOM -FilePath $msgPath -NoNewline
$newHash = (git commit-tree $tree -p $parent -F $msgPath).Trim()
Remove-Item $msgPath -ErrorAction SilentlyContinue

git reset --hard $newHash

Write-Host ""
Write-Host "New commit message:"
git log -1 --pretty=format:%B
Write-Host ""
Write-Host "Next step:"
Write-Host "  git push --force origin main"
