@echo off
REM Run from CMD (outside Cursor):  scripts\fix-cursor-coauthor.bat

cd /d "%~dp0\.."

echo Checking latest commit message...
git log -1 --pretty=format:%%s
git log -1 --pretty=format:%%b
echo.

git log -1 --pretty=format:%%b | findstr /i "cursoragent@cursor.com" >nul
if errorlevel 1 (
  echo No Cursor co-author found in latest commit.
  goto :done
)

echo Rewriting latest commit without Cursor co-author...

for /f "delims=" %%i in ('git show -s --format=%%T HEAD') do set TREE=%%i
for /f "delims=" %%i in ('git rev-parse HEAD~1') do set PARENT=%%i

echo Fix shared package exports so microservices start correctly> .git\fix-msg.txt
for /f "delims=" %%i in ('git commit-tree %TREE% -p %PARENT% -F .git\fix-msg.txt') do set NEW=%%i
del .git\fix-msg.txt

if "%NEW%"=="" (
  echo ERROR: commit-tree failed. Try the manual command below instead.
  goto :done
)

git reset --hard %NEW%

echo.
echo New commit message:
git log -1 --pretty=format:%%s
git log -1 --pretty=format:%%b
echo.
echo Now run:  git push --force origin main

:done
