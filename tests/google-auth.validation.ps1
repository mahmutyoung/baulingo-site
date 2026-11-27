$ErrorActionPreference='Stop'
$repoRoot=Split-Path $PSScriptRoot -Parent
Push-Location $repoRoot
$testRoot=Join-Path $repoRoot '.dev/auth-validation-fixtures'
New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
$valid=Join-Path $testRoot 'desktop.json'
$web=Join-Path $testRoot 'web.json'
$wrong=Join-Path $testRoot 'wrong-project.json'
'{"installed":{"project_id":"baulingo-web","client_id":"test-client","client_secret":"fixture-only","redirect_uris":["http://localhost"]}}' | Set-Content -LiteralPath $valid
'{"web":{"project_id":"baulingo-web","client_id":"test-client","client_secret":"fixture-only"}}' | Set-Content -LiteralPath $web
'{"installed":{"project_id":"other-project","client_id":"test-client","client_secret":"fixture-only","redirect_uris":["http://localhost"]}}' | Set-Content -LiteralPath $wrong
$profile=Join-Path $testRoot 'empty-profile'
$result=& ./scripts/google-auth.ps1 -ClientFile $valid -GcloudConfig $profile -ValidateOnly
if ($result.ClientType -ne 'Desktop app') { throw 'Valid Desktop client was not accepted' }
foreach($invalid in @($web,$wrong)) {
  $rejected=$false
  try { & ./scripts/google-auth.ps1 -ClientFile $invalid -GcloudConfig $profile -ValidateOnly | Out-Null } catch { $rejected=$true }
  if (-not $rejected) { throw 'Unsafe client configuration was accepted' }
}
$fakeGcloud=Join-Path $testRoot 'fake-gcloud.ps1'
$argumentsFile=Join-Path $testRoot 'arguments.json'
@'
@($args) | ConvertTo-Json -Compress | Set-Content -LiteralPath $env:BAULINGO_AUTH_TEST_ARGUMENTS
$global:LASTEXITCODE=1
'@ | Set-Content -LiteralPath $fakeGcloud
$env:BAULINGO_AUTH_TEST_ARGUMENTS=$argumentsFile
try {
  $failed=$false
  try { & ./scripts/google-auth.ps1 -ClientFile $valid -GcloudConfig $profile -Gcloud $fakeGcloud | Out-Null } catch { $failed=$true }
  if (-not $failed) { throw 'A failed authorization command was accepted' }
  $arguments=Get-Content -LiteralPath $argumentsFile -Raw | ConvertFrom-Json
  $scopeArguments=@($arguments | Where-Object { $_ -like '--scopes=*' })
  $expected='--scopes=https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/analytics.readonly,https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/adwords'
  if ($scopeArguments.Count -ne 1 -or $scopeArguments[0] -ne $expected) { throw 'OAuth scopes were not passed as one complete argument' }
} finally {
  Remove-Item Env:BAULINGO_AUTH_TEST_ARGUMENTS -ErrorAction SilentlyContinue
  $global:LASTEXITCODE=0
}
'Desktop OAuth validation passed: client/project checks and complete scope argument; no network calls or credential changes.'
Pop-Location
