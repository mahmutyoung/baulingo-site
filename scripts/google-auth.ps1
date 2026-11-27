param(
  [string]$ClientFile = $env:BAULINGO_GOOGLE_OAUTH_CLIENT_FILE,
  [string]$Gcloud = '',
  [string]$GcloudConfig = (Join-Path $env:APPDATA 'gcloud'),
  [switch]$ValidateOnly
)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path $PSScriptRoot -Parent
$adcPath = Join-Path $GcloudConfig 'application_default_credentials.json'
$existing = $null
if (Test-Path -LiteralPath $adcPath) { $existing = Get-Content -LiteralPath $adcPath -Raw | ConvertFrom-Json }

if (-not $ClientFile) {
  $candidates = @()
  $downloads = Join-Path $env:USERPROFILE 'Downloads'
  foreach ($file in @(Get-ChildItem -LiteralPath $downloads -Filter 'client_secret_*.json' -File -ErrorAction SilentlyContinue)) {
    try {
      $candidate = Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json
      if ($candidate.installed.project_id -eq 'baulingo-web' -and
          (-not $existing -or $candidate.installed.client_id -eq $existing.client_id)) { $candidates += $file.FullName }
    } catch { }
  }
  if ($candidates.Count -ne 1) { throw 'Select the existing baulingo-web Desktop client JSON using -ClientFile or BAULINGO_GOOGLE_OAUTH_CLIENT_FILE. Do not create a new OAuth client.' }
  $ClientFile = $candidates[0]
}
$client = Get-Content -LiteralPath $ClientFile -Raw | ConvertFrom-Json
if (-not $client.installed -or $client.web) { throw 'Google authorization requires the existing Desktop app client, not a Web application client.' }
if ($client.installed.project_id -ne 'baulingo-web') { throw 'Use the existing Desktop client from project baulingo-web.' }
if (-not $client.installed.client_id -or -not $client.installed.client_secret -or
    -not (@($client.installed.redirect_uris) -contains 'http://localhost')) { throw 'The Desktop client JSON is missing its client identity or localhost callback.' }
if ($existing -and $existing.client_id -ne $client.installed.client_id) { throw 'Existing ADC uses a different client. Review the selected profile instead of silently overwriting its identity.' }
$scopes = @('cloud-platform','analytics.readonly','webmasters.readonly','adwords') | ForEach-Object { 'https://www.googleapis.com/auth/' + $_ }
if ($ValidateOnly) {
  [pscustomobject]@{ ClientType='Desktop app'; Project='baulingo-web'; CredentialProfile=$GcloudConfig; RequiredScopes=$scopes }
  return
}
if (-not $Gcloud) {
  $localSdk = Join-Path $repoRoot '.dev/gcloud-cli/google-cloud-sdk/bin/gcloud.cmd'
  if (Test-Path -LiteralPath $localSdk) { $Gcloud = $localSdk }
  else { $Gcloud = (Get-Command gcloud -ErrorAction Stop).Source }
}
$priorConfig = $env:CLOUDSDK_CONFIG
try {
  $env:CLOUDSDK_CONFIG = $GcloudConfig
  $scopeArgument = '--scopes=' + ($scopes -join ',')
  & $Gcloud auth application-default login --client-id-file=$ClientFile $scopeArgument
  if ($LASTEXITCODE -ne 0) { throw 'Desktop OAuth authorization failed. Inspect the exact browser/CLI error before retrying; keep the existing client.' }
  $adc = Get-Content -LiteralPath $adcPath -Raw | ConvertFrom-Json
  if ($adc.client_id -ne $client.installed.client_id) { throw 'The saved grant does not match the selected Desktop client.' }
  # The token is used only in memory to verify the actual grant; never display it.
  $grant = Invoke-RestMethod -Uri 'https://oauth2.googleapis.com/token' -Method Post -Body @{
    grant_type='refresh_token'; client_id=$adc.client_id; client_secret=$adc.client_secret; refresh_token=$adc.refresh_token
  }
  $granted = @($grant.scope -split ' ')
  $missing = @($scopes | Where-Object { $_ -notin $granted })
  if ($missing.Count) { throw ('OAuth grant is missing required scopes: ' + ($missing -join ', ') + '. Approval/verification is separate from the actual grant.') }
  'Verified baulingo-web Desktop OAuth grant for Analytics, Search Console and Google Ads. No campaign or account settings changed.'
} finally {
  $env:CLOUDSDK_CONFIG = $priorConfig
}
