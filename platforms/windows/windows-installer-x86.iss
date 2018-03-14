; Installer Variables
#define AppName "Montage PopCorn"
#define AppScheme "montage"
#define AppVersion "0.0.2"
#define AppPublisher "Kaazing Corp"
#define AppURL "https://montagejs.github.io/popcorn/"
#define AppExeName "run.bat"
#define Architecture = "x86"

[Setup]
; DON'T FUCK WITH THE APPID. This uniquely identifies this application, which is used to find the app if we need to update it.
AppId={{F4B2C5C1-F084-4858-B9C3-E641F5C12BBK}

AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion} {#Architecture}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}

; Make the Installer nicer and Minimalistic
WizardImageFile=.\installer-image.bmp
WizardSmallImageFile=.\installer-image-small.bmp
WindowResizable=no

; Don't ask for a install folder (it goes into \Users\Username\AppData\Roaming\{#AppName}\, which doesn't require admin privileges)
UsePreviousAppDir=yes
DefaultDirName={code:GetDefaultDirName}
DisableDirPage=no

; No Start Menu Folder picker (It's always created)
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes

; We just need a Welcome Page and a Finish page. Nothing else.
DisableReadyPage=yes
DisableFinishedPage=no
DisableWelcomePage=no

; No UAC bullshit
;http://www.jrsoftware.org/ishelp/index.php?topic=setup_privilegesrequired
PrivilegesRequired=none
; Put the uninstaller in the same folder, or else it'll go into Program Files, which requires Admin Privileges
UninstallFilesDir={app}

; Use the same language as the user (or ask otherwise)
ShowLanguageDialog=auto

; Compress the files nicely
Compression=lzma2
SolidCompression=yes

; Final Installer
OutputBaseFilename=..\..\build\releases\{#AppName}-Install-{#AppVersion}-{#Architecture}
SetupIconFile=..\..\app\img\icon.ico
OutputDir=.\
AppCopyright={#AppPublisher}
VersionInfoVersion={#AppVersion}
VersionInfoCompany={#AppPublisher}
VersionInfoCopyright={#AppPublisher}
VersionInfoProductName={#AppName}
VersionInfoProductVersion={#AppVersion}
ArchitecturesAllowed={#Architecture}

[Languages]
Name: "en"; MessagesFile: ".\languages\English.isl"
; Name: "ar"; MessagesFile: ".\languages\Arabic.isl"
; Name: "eu"; MessagesFile: ".\languages\Basque.isl"
; Name: "ptbr"; MessagesFile: ".\languages\BrazilianPortuguese.isl"
; Name: "ca"; MessagesFile: ".\languages\Catalan.isl"
; Name: ""; MessagesFile: ".\languages\Corsican.isl"
; Name: "cs"; MessagesFile: ".\languages\Czech.isl"
; Name: "da"; MessagesFile: ".\languages\Danish.isl"
; Name: "nl"; MessagesFile: ".\languages\Dutch.isl"
; Name: "fi"; MessagesFile: ".\languages\Finnish.isl"
; Name: "fr"; MessagesFile: ".\languages\French.isl"
; Name: "ge"; MessagesFile: ".\languages\German.isl"
; Name: "el"; MessagesFile: ".\languages\Greek.isl"
; Name: "he"; MessagesFile: ".\languages\Hebrew.isl"
; Name: "hu"; MessagesFile: ".\languages\Hungarian.isl"
; Name: "it"; MessagesFile: ".\languages\Italian.isl"
; Name: "ja"; MessagesFile: ".\languages\Japanese.isl"
; Name: ""; MessagesFile: ".\languages\Nepali.isl"
; Name: "no"; MessagesFile: ".\languages\Norwegian.isl"
; Name: "pl"; MessagesFile: ".\languages\Polish.isl"
; Name: "pt"; MessagesFile: ".\languages\Portuguese.isl"
; Name: "ru"; MessagesFile: ".\languages\Russian.isl"
; Name: "sr"; MessagesFile: ".\languages\SerbianCyrillic.isl"
; Name: "sr"; MessagesFile: ".\languages\SerbianLatin.isl"
; Name: "sk"; MessagesFile: ".\languages\Slovak.isl"
; Name: ""; MessagesFile: ".\languages\Slovenian.isl"
; Name: "es"; MessagesFile: ".\languages\Spanish.isl"
; Name: "sv"; MessagesFile: ".\languages\Swedish.isl"
; Name: "zh-tw"; MessagesFile: ".\languages\TraditonalChinese.isl"
; Name: "tk"; MessagesFile: ".\languages\Turkish.isl"
; Name: ""; MessagesFile: ".\languages\Ukrainian.isl"

[Files]
Source: ".\run.bat"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\app\*"; DestDir: "{app}\www\app\"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\package.json"; DestDir: "{app}\www\"; Flags: ignoreversion 
Source: "..\..\build\binaries\{#AppVersion}\win32\*"; DestDir: "{app}\bin\"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Add an Icon in the app folder as a reference
Name: "{app}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\bin\{#AppName}.exe"; Parameters:"""{app}\www"""; IconFilename: "{app}\www\app\img\icon.ico"; Flags: runminimized preventpinning
; Another in the group (this one can be featured)
Name: "{group}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\bin\{#AppName}.exe"; Parameters:"""{app}\www"""; IconFilename: "{app}\www\app\img\icon.ico"; Flags: runminimized
; Another in the desktop
Name: "{commondesktop}\{#AppName}"; WorkingDir: "{app}"; Filename: "{app}\bin\{#AppName}.exe"; Parameters:"""{app}\www"""; IconFilename: "{app}\www\app\img\icon.ico"; Flags: runminimized preventpinning

[Run]
; Run the app after installing

Filename: "{app}\bin\{#AppName}.exe"; Parameters: """{app}\www"""; Description: "{cm:LaunchProgram,{#StringChange(AppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent runminimized

[Registry]
; http://www.jrsoftware.org/ishelp/index.php?topic=registrysection
; https://msdn.microsoft.com/en-us/library/windows/desktop/ms724475(v=vs.85).aspx
; The root key. This must be one of the following values:
; 
; HKCR	(HKEY_CLASSES_ROOT)
; HKCU	(HKEY_CURRENT_USER)
; HKLM	(HKEY_LOCAL_MACHINE)
; HKU	(HKEY_USERS)
; HKCC	(HKEY_CURRENT_CONFIG)
;
Root: HKCR; Subkey: "{#AppScheme}"; ValueType: "string"; ValueData: "URL:Custom Protocol"; Flags: uninsdeletekey
Root: HKCR; Subkey: "{#AppScheme}"; ValueType: "string"; ValueName: "URL Protocol"; ValueData: ""
Root: HKCR; Subkey: "{#AppScheme}\DefaultIcon"; ValueType: "string"; ValueData: "{app}\www\app\img\icon.ico"
Root: HKCR; Subkey: "{#AppScheme}\shell\open\command"; ValueType: "string"; ValueData: """{app}\bin\{#AppName}.exe"" ""{app}\www"" ""%1"""

[Code]
function GetDefaultDirName(Param: string): string;
begin
  if IsAdminLoggedOn then
  begin
    Result := ExpandConstant('{pf}\{#AppName}');
  end
    else
  begin
    Result := ExpandConstant('{userappdata}\{#AppName}');
  end;
end;