<#
.SYNOPSIS
    Registers the Cleanera Weekly Thursday Backup task in Windows Task Scheduler.
.DESCRIPTION
    Run this script ONCE in Windows PowerShell as Administrator.
    It registers a scheduled task to run 'cleanera-backup.ps1' every Thursday at 7:00 PM.
#>

$TaskName = "Cleanera Weekly CRM Backup"
$ScriptPath = "C:\Cleanera Backups\cleanera-backup.ps1"

# Check if script exists at target location, prompt to copy if needed
if (-not (Test-Path $ScriptPath)) {
    $currentScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $localScript = Join-Path $currentScriptDir "cleanera-backup.ps1"
    if (Test-Path $localScript) {
        if (-not (Test-Path "C:\Cleanera Backups")) {
            New-Item -ItemType Directory -Path "C:\Cleanera Backups" -Force | Out-Null
        }
        Copy-Item -Path $localScript -Destination $ScriptPath -Force
        Write-Host "[OK] Copied cleanera-backup.ps1 to C:\Cleanera Backups\" -ForegroundColor Green
    }
}

# Define Thursday 7:00 PM Trigger
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Thursday -At "19:00"

# Define Action: Run PowerShell with ExecutionPolicy Bypass
$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

# Define Settings (wake machine if needed, retry on failure)
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

try {
    # Unregister existing task if present to avoid duplication
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

    # Register the task
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Trigger $Trigger `
        -Action $Action `
        -Settings $Settings `
        -Description "Automatically downloads and archives Cleanera CRM backup to C:\Cleanera Backups every Thursday at 7:00 PM."

    Write-Host ""
    Write-Host "[SUCCESS] Task '$TaskName' registered successfully!" -ForegroundColor Green
    Write-Host "Schedule: Every Thursday at 7:00 PM (19:00)" -ForegroundColor Cyan
    Write-Host "Destination: C:\Cleanera Backups\" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Error "Failed to register scheduled task. Ensure you run PowerShell as Administrator. Error: $_"
}
