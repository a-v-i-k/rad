
rem ZIP EXECUTABLE
SET ZIPEXEC="C:\Program Files\7-Zip\7z"
SET ZIPPARAMS=a

rem VERSION
SET version-major=1
SET version-minor=0
SET version-patch=2

rem OUTPUT FILE
SET ZIPFILE=rad-v%version-major%.%version-minor%.%version-patch%.zip

rem PRECLEAN
if exist %ZIPFILE% (
  del %ZIPFILE%
)

rem ZIP
%ZIPEXEC% %ZIPPARAMS% %ZIPFILE% ..\rad\
