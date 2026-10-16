# Sync live Razorpay keys from local .env to Vercel production.
# Usage (after: npx vercel login && npx vercel link --yes):
#   powershell -ExecutionPolicy Bypass -File scripts\sync-vercel-razorpay.ps1
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Get-DotEnvValue([string]$Key) {
  $line = Get-Content .env | Where-Object { $_ -match "^$Key=" } | Select-Object -First 1
  if (-not $line) { throw "Missing $Key in .env" }
  return ($line -replace "^$Key=", "").Trim().Trim('"').Trim("'")
}

$keyId = Get-DotEnvValue "NEXT_PUBLIC_RAZORPAY_KEY_ID"
$secret = Get-DotEnvValue "RAZORPAY_KEY_SECRET"

if (-not $keyId.StartsWith("rzp_live_")) {
  throw "NEXT_PUBLIC_RAZORPAY_KEY_ID is not a live key (expected rzp_live_*)"
}

Write-Host "Syncing Razorpay live keys to Vercel production (values never printed)..."
Write-Host "KEY_ID prefix: $($keyId.Substring(0, [Math]::Min(12, $keyId.Length)))***  len=$($keyId.Length)"
Write-Host "SECRET len=$($secret.Length)"

# Remove stale production values (ignore failures if missing)
npx vercel env rm NEXT_PUBLIC_RAZORPAY_KEY_ID production -y 2>$null
npx vercel env rm RAZORPAY_KEY_SECRET production -y 2>$null

# Pipe values to avoid interactive prompts / shell history echo where possible
$keyId | npx vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production
$secret | npx vercel env add RAZORPAY_KEY_SECRET production

Write-Host "Done. Redeploy with: npx vercel --prod --yes"
