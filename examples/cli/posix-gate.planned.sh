#!/bin/sh
set -eu

target_id="<verified-target-id>"
suite_lock="<suite-lock-file>"
work_directory="$(mktemp -d)"
report_file="$work_directory/report.json"
manifest_file="$work_directory/release-manifest.json"

cleanup() {
  rm -rf -- "$work_directory"
}
trap cleanup EXIT HUP INT TERM

rampspec scenario validate "<scenario-file>" --output json
rampspec run start --target "$target_id" --lock "$suite_lock" --wait --output json >"$work_directory/run.json"
rampspec report download --run "<run-id-from-validated-json>" --output-file "$report_file" --manifest-file "$manifest_file"
rampspec report verify "$report_file" --manifest "$manifest_file" --offline --output json
rampspec ci gate --report "$report_file" --policy "<policy-id>" --output json
