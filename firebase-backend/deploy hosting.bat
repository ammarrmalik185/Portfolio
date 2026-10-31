@echo off
cd /d "%~dp0..\public-frontend"
call npm run deploy:hosting
exit /b %errorlevel%
