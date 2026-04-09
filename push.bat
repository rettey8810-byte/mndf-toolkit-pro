@echo off
cd /d "%~dp0"
echo Pushing to GitHub...
git add -A
git commit -m "%1" 2>nul || echo No changes to commit
git push origin main
echo Done!
pause
