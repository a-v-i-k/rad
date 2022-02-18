
rem VERSION
SET version-major=0
SET version-minor=0

rem OUTPUT FILE
SET ZIPFILE=25rooms-v%version-major%.%version-minor%.zip

rem PRECLEAN
if exist %ZIPFILE% (
  del %ZIPFILE%
)

rem ZIP
"C:\Program Files\7-Zip\7z" a %ZIPFILE% ..\25rooms\

rem BACKUP
COPY /Y %ZIPFILE% C:\Users\kavi\Dropbox\avik\__backup__\web\25rooms\%ZIPFILE%
