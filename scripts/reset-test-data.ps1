param(
    [string]$DbHost = $(if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }),
    [string]$DbPort = $(if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }),
    [string]$DbName = $(if ($env:DB_NAME) { $env:DB_NAME } else { "new_gen_palcepro" }),
    [string]$DbUser = $(if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "postgres" }),
    [string]$DbPassword = $env:DB_PASSWORD
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$SeedFile = Join-Path $Root "database\005_final_testing_dataset.sql"

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "psql was not found. Install PostgreSQL client tools and make sure psql is available in PATH."
}

if (-not (Test-Path $SeedFile)) {
    throw "Seed file not found: $SeedFile"
}

if ($DbPassword) {
    $env:PGPASSWORD = $DbPassword
}

Write-Host "Resetting PlacePro QA data in database '$DbName' on ${DbHost}:${DbPort}..."
psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -v ON_ERROR_STOP=1 -f $SeedFile
Write-Host "Final QA test data loaded successfully."
