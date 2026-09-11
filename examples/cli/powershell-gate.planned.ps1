$ErrorActionPreference = "Stop"
$TargetId = "<verified-target-id>"
$SuiteLock = Join-Path $PWD "<suite-lock-file>"
$WorkDirectory = Join-Path $env:TEMP "<unique-work-directory>"
$ReportFile = Join-Path $WorkDirectory "report.json"
$ManifestFile = Join-Path $WorkDirectory "release-manifest.json"

New-Item -ItemType Directory -Path $WorkDirectory | Out-Null

try {
  rampspec scenario validate "<scenario-file>" --output json
  if ($LASTEXITCODE -ne 0) { throw "Scenario validation failed" }

  $RunResult = rampspec run start --target $TargetId --lock $SuiteLock --wait --output json
  $RunExit = $LASTEXITCODE
  $RunResult | Set-Content -LiteralPath (Join-Path $WorkDirectory "run.json")
  if ($RunExit -ne 0) { throw "Run did not complete successfully: $RunExit" }

  rampspec report download --run "<run-id-from-validated-json>" --output-file $ReportFile --manifest-file $ManifestFile
  if ($LASTEXITCODE -ne 0) { throw "Report download failed" }

  rampspec report verify $ReportFile --manifest $ManifestFile --offline --output json
  if ($LASTEXITCODE -ne 0) { throw "Report verification failed" }

  rampspec ci gate --report $ReportFile --policy "<policy-id>" --output json
  if ($LASTEXITCODE -ne 0) { throw "Policy gate did not pass" }
}
finally {
  Remove-Item -LiteralPath $WorkDirectory -Recurse -Force -ErrorAction SilentlyContinue
}
