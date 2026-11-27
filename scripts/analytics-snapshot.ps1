param(
  [Parameter(Mandatory=$true)][ValidateSet('daily','weekly','monthly')][string]$Cadence,
  [string]$Gcloud = 'gcloud',
  [string]$GcloudConfig = (Join-Path $env:APPDATA 'gcloud'),
  [string]$Segment = 'worldwide',
  [string]$Family = 'all'
)
$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
$priorToken = $env:BAULINGO_GA4_ACCESS_TOKEN
$priorQuota = $env:BAULINGO_GA4_QUOTA_PROJECT
$priorConfig = $env:CLOUDSDK_CONFIG
try {
  if ($GcloudConfig) { $env:CLOUDSDK_CONFIG = $GcloudConfig }
  if (-not $env:BAULINGO_GA4_ACCESS_TOKEN) {
    if (Get-Command $Gcloud -ErrorAction SilentlyContinue) {
      $accessToken = & $Gcloud auth application-default print-access-token 2>$null
      if ($LASTEXITCODE -eq 0 -and $accessToken) { $env:BAULINGO_GA4_ACCESS_TOKEN = ($accessToken -join '').Trim() }
    }
  }
  $env:BAULINGO_GA4_QUOTA_PROJECT = 'baulingo-web'
  $arguments = @('scripts/analytics-snapshot.ts', $Cadence)
  if ($Segment) { $arguments += @('--segment', $Segment) }
  if ($Family) { $arguments += @('--family', $Family) }
  & node @arguments
  $snapshotExit = $LASTEXITCODE
} finally {
  $env:BAULINGO_GA4_ACCESS_TOKEN = $priorToken
  $env:BAULINGO_GA4_QUOTA_PROJECT = $priorQuota
  $env:CLOUDSDK_CONFIG = $priorConfig
  Pop-Location
}
exit $snapshotExit
