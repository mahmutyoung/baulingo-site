param([switch]$Apply)
$ErrorActionPreference='Stop'
$repoRoot=Split-Path $PSScriptRoot -Parent
$launcher=Join-Path $PSScriptRoot 'analytics-snapshot.ps1'
$gcloud=Join-Path $repoRoot '.dev/gcloud-cli/google-cloud-sdk/bin/gcloud.cmd'
if (-not (Test-Path -LiteralPath $gcloud)) { $gcloud=(Get-Command gcloud -ErrorAction Stop).Source }
$powershell=(Get-Command powershell.exe -ErrorAction Stop).Source
$identity=[System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$service=New-Object -ComObject 'Schedule.Service'
$service.Connect()
$folder=$service.GetFolder('\')
$plans=@(
  @{Name='Baulingo Analytics Daily';Cadence='daily';Type=2;Time='09:30:00'},
  @{Name='Baulingo Analytics Weekly';Cadence='weekly';Type=3;Time='10:00:00'},
  @{Name='Baulingo Analytics Monthly';Cadence='monthly';Type=4;Time='10:30:00'}
)
$output=Join-Path $repoRoot '.dev/scheduler'
New-Item -ItemType Directory -Path $output -Force | Out-Null
$results=@()
foreach($plan in $plans) {
  $task=$service.NewTask(0)
  $task.RegistrationInfo.Description='Baulingo local read-only analytics extraction. Reports remain in ignored .dev; partial data returns exit 1. Managed by scripts/schedule-analytics.ps1.'
  $task.Principal.UserId=$identity
  $task.Principal.LogonType=3 # Current interactive user; no stored password.
  $task.Principal.RunLevel=0 # Limited, not elevated.
  $task.Settings.Enabled=$true
  $task.Settings.Hidden=$true
  $task.Settings.StartWhenAvailable=$true
  $task.Settings.MultipleInstances=2 # Ignore a new instance while this task is running.
  $task.Settings.ExecutionTimeLimit='PT45M'
  $task.Settings.DisallowStartIfOnBatteries=$false
  $task.Settings.StopIfGoingOnBatteries=$false
  $trigger=$task.Triggers.Create($plan.Type)
  $trigger.StartBoundary=(Get-Date -Format 'yyyy-MM-dd')+'T'+$plan.Time
  $trigger.Enabled=$true
  if($plan.Cadence -eq 'daily') { $trigger.DaysInterval=1 }
  if($plan.Cadence -eq 'weekly') { $trigger.WeeksInterval=1; $trigger.DaysOfWeek=2 }
  if($plan.Cadence -eq 'monthly') { $trigger.DaysOfMonth=1; $trigger.MonthsOfYear=4095 }
  $action=$task.Actions.Create(0)
  $action.Path=$powershell
  $action.Arguments='-NoProfile -NonInteractive -WindowStyle Hidden -File "'+$launcher+'" -Cadence '+$plan.Cadence+' -Gcloud "'+$gcloud+'" -GcloudConfig "'+(Join-Path $env:APPDATA 'gcloud')+'"'
  $action.WorkingDirectory=$repoRoot
  $existing=$null
  try { $existing=$folder.GetTask($plan.Name) } catch { }
  if($existing -and ($existing.Definition.Actions.Count -ne 1 -or
      $existing.Definition.Actions.Item(1).Path -ne $powershell -or
      -not $existing.Definition.Actions.Item(1).Arguments.Contains($launcher))) {
    throw ('A task named '+$plan.Name+' exists with a different action. It was not overwritten.')
  }
  $task.XmlText | Set-Content -LiteralPath (Join-Path $output ($plan.Cadence+'.xml')) -Encoding UTF8
  if($Apply) {
    $registered=$folder.RegisterTaskDefinition($plan.Name,$task,6,$identity,$null,3)
    $results += [pscustomobject]@{Name=$registered.Name;State=$registered.State;Cadence=$plan.Cadence;NextRun=$registered.NextRunTime;Registered=$true}
  } else {
    # Native validation only; TASK_VALIDATE_ONLY does not register a task.
    $null=$folder.RegisterTaskDefinition($plan.Name,$task,1,$identity,$null,3)
    $results += [pscustomobject]@{Name=$plan.Name;Cadence=$plan.Cadence;Registered=$false;Validation='passed'}
  }
}
$results | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $output 'status.json') -Encoding UTF8
$results | Format-Table -AutoSize
