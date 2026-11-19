@echo off
title DevSecOps Security Scanner - Gitleaks and Trivy
echo ================================================================
echo  CloudCert DevSecOps Security Scan Suite
echo  Student: Jayakrishnan Sharangan (Reg: 12324644)
echo ================================================================
echo.

set "PROJECT_DIR=%~dp0"
set "REPORTS_DIR=%PROJECT_DIR%security-reports"
set "GITLEAKS_EXE=%PROJECT_DIR%tools\gitleaks\gitleaks.exe"
set "TRIVY_EXE=%PROJECT_DIR%tools\trivy\trivy.exe"

if not exist "%REPORTS_DIR%" mkdir "%REPORTS_DIR%"

echo [1/2] Running Gitleaks (Secret Detection)...
echo ----------------------------------------------------------------
"%GITLEAKS_EXE%" detect --source="%PROJECT_DIR%" --report-path="%REPORTS_DIR%\gitleaks-report.json" --verbose --no-git=false
if %ERRORLEVEL% equ 0 (
    echo [PASS] Gitleaks: No secret leaks detected in git history!
) else (
    echo [WARN] Gitleaks detected potential secret patterns. See security-reports\gitleaks-report.json
)
echo.

echo [2/2] Running Trivy (IaC, Dockerfile, and Dependency Security Scan)...
echo ----------------------------------------------------------------
"%TRIVY_EXE%" fs --skip-dirs "jenkins,tools,monitoring,backend/node_modules,frontend/node_modules" --scanners vuln,misconfig,secret --format table -o "%REPORTS_DIR%\trivy-report.txt" "%PROJECT_DIR%"
type "%REPORTS_DIR%\trivy-report.txt"
echo.
echo ================================================================
echo Security reports saved to:
echo   - %REPORTS_DIR%\gitleaks-report.json
echo   - %REPORTS_DIR%\trivy-report.txt
echo ================================================================
pause
