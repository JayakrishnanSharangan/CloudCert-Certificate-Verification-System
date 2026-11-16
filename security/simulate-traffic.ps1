# Traffic Generator to populate Prometheus & Grafana Metrics
param (
    [string]$TargetHost = "http://localhost:5000",
    [int]$Iterations = 30
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Simulating Live Traffic for Prometheus & Grafana" -ForegroundColor Cyan
Write-Host "Target: $TargetHost" -ForegroundColor Cyan
Write-Host "Iterations: $Iterations" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$Endpoints = @(
    "/api/certificates/verify/CERT-2026-LPU-001",
    "/api/certificates/verify/CERT-2026-LPU-002",
    "/api/certificates/verify/CERT-FAKE-999",
    "/api/certificates",
    "/health"
)

for ($i = 1; $i -le $Iterations; $i++) {
    $endpoint = $Endpoints | Get-Random
    $url = "$TargetHost$endpoint"
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 2
        Write-Host "[$i/$Iterations] GET $endpoint -> Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "[$i/$Iterations] GET $endpoint -> Notice: Handled non-200 outcome" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds (Get-Random -Minimum 100 -Maximum 400)
}

Write-Host "Traffic generation complete! Check Grafana at http://localhost:3001" -ForegroundColor Green
