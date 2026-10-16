# Registers (or replaces) a Windows scheduled task that runs auto-commit.ps1 every 10 minutes.
# Remove it with:  Unregister-ScheduledTask -TaskName MarketplaceAutoCommit -Confirm:$false

$script = Join-Path $PSScriptRoot "auto-commit.ps1"
# conhost --headless keeps a console window from flashing every 10 minutes.
$action = New-ScheduledTaskAction -Execute "conhost.exe" `
    -Argument "--headless powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$script`""
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
    -RepetitionInterval (New-TimeSpan -Minutes 10)
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries `
    -AllowStartIfOnBatteries -MultipleInstances IgnoreNew `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName "MarketplaceAutoCommit" -Action $action -Trigger $trigger `
    -Settings $settings -Description "Auto-commit and push soulsense-usa every 10 minutes" -Force |
    Out-Null
Write-Output "Scheduled task 'MarketplaceAutoCommit' registered (every 10 minutes)."
