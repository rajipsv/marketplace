# Auto-save: commits and pushes any changes in this repo.
# Run every 10 minutes by the Windows scheduled task "MarketplaceAutoCommit"
# (see scripts/register-auto-commit.ps1). Safe to run by hand.

$ErrorActionPreference = "Continue"
$repo = Split-Path -Parent $PSScriptRoot
$log = Join-Path $PSScriptRoot "auto-commit.log"
Set-Location $repo

function Write-Log($msg) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Out-File -FilePath $log -Append -Encoding utf8
}

# Don't interfere with a merge, rebase or cherry-pick in progress.
$gitDir = (git rev-parse --git-dir).Trim()
foreach ($marker in "MERGE_HEAD", "rebase-merge", "rebase-apply", "CHERRY_PICK_HEAD") {
    if (Test-Path (Join-Path $gitDir $marker)) {
        Write-Log "skipped: $marker in progress"
        exit 0
    }
}

if (-not (git status --porcelain)) { exit 0 }

git add -A
git commit -q -m "chore: auto-save $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
if ($LASTEXITCODE -ne 0) { Write-Log "commit failed"; exit 1 }

$branch = (git rev-parse --abbrev-ref HEAD).Trim()
git push -q origin $branch
if ($LASTEXITCODE -ne 0) { Write-Log "push failed (commit kept locally)"; exit 1 }

Write-Log "committed and pushed to $branch"
