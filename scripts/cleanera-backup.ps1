<#
.SYNOPSIS
    Automated Weekly Thursday Backup Script for Cleanera Dry Cleaning CRM.
.DESCRIPTION
    Connects to the secured Cleanera CRM /api/backup/latest endpoint using the
    X-Backup-Key secret, verifies the backup payload, and saves a timestamped
    copy into 'C:\Cleanera Backups\' without overwriting any previous backups.
#>

# ==========================================
# CONFIGURATION
# ==========================================
$BackupDir = "C:\Cleanera Backups"

# Replace with your app URL (or set CLEANERA_CRM_URL environment variable):
$CrmUrl = $env:CLEANERA_CRM_URL
if ([string]::IsNullOrWhiteSpace($CrmUrl)) {
    $CrmUrl = "https://ais-dev-vdulesghu3r4swggt7uin4-595894102391.asia-southeast1.run.app/api/backup/latest"
}

# Read the secret key securely from Windows environment variable: CLEANERA_BACKUP_KEY
# (Checks Process, Machine/System, and User environment scopes)
$SecretKey = $env:CLEANERA_BACKUP_KEY
if ([string]::IsNullOrWhiteSpace($SecretKey)) {
    $SecretKey = [System.Environment]::GetEnvironmentVariable("CLEANERA_BACKUP_KEY", "Machine")
}
if ([string]::IsNullOrWhiteSpace($SecretKey)) {
    $SecretKey = [System.Environment]::GetEnvironmentVariable("CLEANERA_BACKUP_KEY", "User")
}

# Log file for automated Task Scheduler execution
$LogFile = Join-Path $BackupDir "backup_execution.log"

# ==========================================
# 1. ENSURE DESTINATION DIRECTORY EXISTS
# ==========================================
if (-not (Test-Path -Path $BackupDir)) {
    try {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Host "[OK] Created directory: $BackupDir" -ForegroundColor Green
    } catch {
        Write-Error "Failed to create directory $BackupDir. Error: $_"
        exit 1
    }
}

function Log-Message([string]$msg, [string]$color = "White") {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $msg"
    Write-Host $line -ForegroundColor $color
    try {
        Add-Content -Path $LogFile -Value $line -ErrorAction SilentlyContinue
    } catch {}
}

Log-Message "=== Starting Cleanera Automated CRM Backup ===" "Cyan"

# Verify that the environment variable was provided
if ([string]::IsNullOrWhiteSpace($SecretKey)) {
    Log-Message "[ERROR] Windows environment variable 'CLEANERA_BACKUP_KEY' is not set or is empty." "Red"
    Log-Message "Please set CLEANERA_BACKUP_KEY in your Windows environment before running this script." "Yellow"
    Log-Message "Example command in PowerShell (Admin): [System.Environment]::SetEnvironmentVariable('CLEANERA_BACKUP_KEY', 'your_key', 'Machine')" "Yellow"
    exit 1
}

# ==========================================
# 2. GENERATE UNIQUE NON-OVERWRITING FILENAME
# ==========================================
$dateStamp = Get-Date -Format "yyyy-MM-dd"
$baseName = "Cleanera_Backup_$dateStamp"
$extension = ".json"
$destinationFile = Join-Path $BackupDir "$baseName$extension"

# If a file for today already exists, add an incremental counter so old backups are NEVER overwritten
if (Test-Path -Path $destinationFile) {
    $timeSuffix = Get-Date -Format "HH-mm-ss"
    $destinationFile = Join-Path $BackupDir "${baseName}_$timeSuffix$extension"
}

# ==========================================
# 3. SECURELY DOWNLOAD BACKUP VIA API
# ==========================================
$headers = @{
    "X-Backup-Key" = $SecretKey
    "Accept"       = "application/json"
    "User-Agent"   = "Cleanera-Windows-Backup-Client/1.0"
}

$tempFile = Join-Path $BackupDir "backup_temp.json"

try {
    Log-Message "Contacting CRM server at $CrmUrl..." "Yellow"

    # Enforce TLS 1.2+ for secure HTTPS transmission
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

    # Fetch backup payload
    Invoke-WebRequest -Uri $CrmUrl `
        -Headers $headers `
        -OutFile $tempFile `
        -TimeoutSec 60 `
        -UseBasicParsing

    # Verify that file was created and is non-empty
    if (-not (Test-Path -Path $tempFile) -or (Get-Item $tempFile).Length -lt 100) {
        throw "Downloaded backup file is empty or suspiciously small."
    }

    # Verify that downloaded content is valid JSON (and not an HTML gateway/redirect page)
    $content = Get-Content -Path $tempFile -Raw -ErrorAction Stop
    $trimmed = $content.Trim()
    if ($trimmed.StartsWith("<")) {
        $firstLine = ($trimmed -split "`n")[0].Trim()
        throw "Server or gateway returned HTML instead of a JSON backup file (Got: '$firstLine'). If accessing the development preview URL, the preview gateway requires an interactive browser session. Please point `$CrmUrl` to your production domain or local/tunnel URL."
    }

    $parsed = $content | ConvertFrom-Json -ErrorAction Stop

    if ($parsed.PSObject.Properties['success'] -and $parsed.success -eq $false) {
        throw "Server returned error: $($parsed.error)"
    }

    # Ensure required CRM backup root properties are present
    if (-not ($parsed.PSObject.Properties['backupMetadata'] -or $parsed.PSObject.Properties['customers'] -or $parsed.PSObject.Properties['orders'])) {
        throw "Downloaded file is valid JSON but does not match the expected Cleanera CRM backup schema."
    }

    # Atomically move verified temp file to the final destination
    Move-Item -Path $tempFile -Destination $destinationFile -Force

    $fileSize = (Get-Item $destinationFile).Length
    $sizeFormatted = "{0:N2} KB" -f ($fileSize / 1KB)

    Log-Message "[SUCCESS] Backup saved: $destinationFile ($sizeFormatted)" "Green"
    Log-Message "=== Cleanera Backup Completed Successfully ===" "Cyan"
    exit 0

} catch {
    Log-Message "[ERROR] Backup failed: $_" "Red"
    if (Test-Path -Path $tempFile) {
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    }
    exit 1
}
