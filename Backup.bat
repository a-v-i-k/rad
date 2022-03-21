
rem VERSION
SET version-major=1
SET version-minor=02

rem OUTPUT FILE
SET ZIPFILE=rad-v%version-major%.%version-minor%.zip

rem PRECLEAN
if exist %ZIPFILE% (
  del %ZIPFILE%
)

rem ZIP
"C:\Program Files\7-Zip\7z" a %ZIPFILE% ..\rad\

rem BACKUP
COPY /Y %ZIPFILE% C:\Users\kavi\Dropbox\avik\__backup__\web\rad\%ZIPFILE%
