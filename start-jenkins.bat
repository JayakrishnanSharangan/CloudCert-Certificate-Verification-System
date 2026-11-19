@echo off
title Jenkins Server - CloudCert DevSecOps
echo ==========================================================
echo Starting Jenkins for CloudCert Pipeline Demo
echo ==========================================================
echo Port: http://localhost:8080
echo Initial Admin Password: c0a796a6c91945c68131a420941fc795
echo ==========================================================

set "JAVA_EXE=C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot\bin\java.exe"
set "JENKINS_WAR=%~dp0jenkins\jenkins.war"
set "JENKINS_HOME=%~dp0jenkins\home"

if not exist "%JAVA_EXE%" (
    echo [ERROR] Java not found at %JAVA_EXE%
    pause
    exit /b 1
)

start "" http://localhost:8080

"%JAVA_EXE%" "-DJENKINS_HOME=%JENKINS_HOME%" -jar "%JENKINS_WAR%" --httpPort=8080

pause
