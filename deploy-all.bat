@echo off
title CloudCert - 1-Click Master Deploy & Launch Engine
powershell -ExecutionPolicy Bypass -File "%~dp0deploy-all.ps1"
pause
