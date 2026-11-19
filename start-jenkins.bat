@echo off
title Jenkins Server - CloudCert DevSecOps
echo ==========================================================
echo Starting Jenkins for CloudCert Pipeline Demo
echo ==========================================================
echo Port: http://localhost:8080

set "JAVA_EXE=C:\Program Files\Microsoft\jdk-21.0.13.21-hotspot\bin\java.exe"
set "JENKINS_WAR=%~dp0jenkins\jenkins.war"
set "JENKINS_HOME=%~dp0jenkins\home"
set "PWD_FILE=%JENKINS_HOME%\secrets\initialAdminPassword"

if exist "%PWD_FILE%" (
    set /p ADMIN_PWD=<"%PWD_FILE%"
    echo Admin Password loaded from secure secrets store.
)
echo ==========================================================

if not exist "%JAVA_EXE%" (
    echo [ERROR] Java not found at %JAVA_EXE%
    pause
    exit /b 1
)

start "" http://localhost:8080

"%JAVA_EXE%" "-DJENKINS_HOME=%JENKINS_HOME%" -jar "%JENKINS_WAR%" --httpPort=8080

pause
