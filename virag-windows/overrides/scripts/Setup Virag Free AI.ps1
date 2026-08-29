$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

function Title($text) { Write-Host "`n=== $text ===" -ForegroundColor Cyan }
function Good($text) { Write-Host "[OK] $text" -ForegroundColor Green }
function Note($text) { Write-Host "[Virag] $text" -ForegroundColor Gray }
function Fail($text) { Write-Host "[ERROR] $text" -ForegroundColor Red }
function Refresh-Path {
  $machine=[Environment]::GetEnvironmentVariable('Path','Machine')
  $user=[Environment]::GetEnvironmentVariable('Path','User')
  $env:Path="$machine;$user;$env:LOCALAPPDATA\Microsoft\WinGet\Links;$env:LOCALAPPDATA\Programs\Ollama"
}
function Find-Exe([string]$name) {
  Refresh-Path
  $cmd=Get-Command $name -ErrorAction SilentlyContinue
  if($cmd){ return $cmd.Source }
  $roots=@("$env:LOCALAPPDATA\Programs\Ollama","$env:LOCALAPPDATA\Microsoft\WinGet\Links","$env:LOCALAPPDATA\Microsoft\WinGet\Packages") | Where-Object { $_ -and (Test-Path $_) }
  foreach($root in $roots){
    $hit=Get-ChildItem -Path $root -Filter $name -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if($hit){ return $hit.FullName }
  }
  return $null
}

Clear-Host
Write-Host 'VIRAG — WINDOWS 11 FREE LOCAL AI SETUP' -ForegroundColor Cyan
Write-Host 'No OpenAI credits. AI + speech run locally on this PC.' -ForegroundColor White
Write-Host 'This setup downloads Ollama, Qwen3-VL, FFmpeg, whisper.cpp and a Whisper speech model.' -ForegroundColor DarkGray

if(-not [Environment]::Is64BitOperatingSystem){ Fail 'Virag requires 64-bit Windows 11.'; Read-Host 'Press Enter to close'; exit 1 }
if($env:OS -ne 'Windows_NT'){ Fail 'This setup is for Windows.'; Read-Host 'Press Enter to close'; exit 1 }

$root=Join-Path $env:USERPROFILE '.virag'
$models=Join-Path $root 'models'
$whisperDir=Join-Path $root 'whisper'
New-Item -ItemType Directory -Force -Path $root,$models,$whisperDir | Out-Null

try {
  Title '1/4 Ollama local AI engine'
  $ollama=Find-Exe 'ollama.exe'
  if(-not $ollama){
    if(Get-Command winget -ErrorAction SilentlyContinue){
      Note 'Installing Ollama with Windows Package Manager...'
      & winget install -e --id Ollama.Ollama --silent --accept-package-agreements --accept-source-agreements
      Refresh-Path
    } else {
      Note 'winget is unavailable. Running the official Ollama Windows installer...'
      $ollamaSetup=Join-Path $env:TEMP 'OllamaSetup.exe'
      Invoke-WebRequest 'https://ollama.com/download/OllamaSetup.exe' -OutFile $ollamaSetup -UseBasicParsing
      Start-Process -FilePath $ollamaSetup -ArgumentList '/S' -Wait
    }
    $ollama=Find-Exe 'ollama.exe'
  }
  if(-not $ollama){ throw 'Ollama could not be installed. Install it from https://ollama.com/download/windows and run this setup again.' }
  Good "Ollama: $ollama"
  try { Invoke-RestMethod 'http://127.0.0.1:11434/api/tags' -TimeoutSec 2 | Out-Null }
  catch { Start-Process -FilePath $ollama -ArgumentList 'serve' -WindowStyle Hidden; Start-Sleep -Seconds 3 }

  $ram=[math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB)
  $model=if($ram -ge 16){'qwen3-vl:4b'}else{'qwen3-vl:2b'}
  Note "Detected about $ram GB RAM. Installing $model (free local vision + tool model)..."
  & $ollama pull $model
  if($LASTEXITCODE -ne 0){ throw "Ollama could not pull $model." }
  Good "$model installed"

  Title '2/4 FFmpeg audio converter'
  $ffmpeg=Find-Exe 'ffmpeg.exe'
  if(-not $ffmpeg){
    if(-not (Get-Command winget -ErrorAction SilentlyContinue)){ throw 'Windows Package Manager (winget) is required to install FFmpeg automatically.' }
    Note 'Installing FFmpeg...'
    & winget install -e --id Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements
    Refresh-Path
    $ffmpeg=Find-Exe 'ffmpeg.exe'
  }
  if(-not $ffmpeg){ throw 'FFmpeg installation finished but ffmpeg.exe was not found. Restart Windows and run Setup again.' }
  Good "FFmpeg: $ffmpeg"

  Title '3/4 whisper.cpp local speech recognition'
  $whisper=Get-ChildItem -Path $whisperDir -Filter 'whisper-cli.exe' -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  if(-not $whisper){
    Note 'Downloading the current official Windows x64 whisper.cpp build...'
    $release=Invoke-RestMethod -Uri 'https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest' -Headers @{'User-Agent'='Virag-Windows-Setup'}
    $asset=$release.assets | Where-Object { $_.name -eq 'whisper-bin-x64.zip' } | Select-Object -First 1
    if(-not $asset){ throw 'Could not find whisper-bin-x64.zip in the current whisper.cpp release.' }
    $zip=Join-Path $env:TEMP 'virag-whisper-x64.zip'
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $zip -UseBasicParsing
    Remove-Item $whisperDir -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path $whisperDir | Out-Null
    Expand-Archive -Path $zip -DestinationPath $whisperDir -Force
    $whisper=Get-ChildItem -Path $whisperDir -Filter 'whisper-cli.exe' -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
  }
  if(-not $whisper){ throw 'whisper-cli.exe was not found after extraction.' }
  Good "Whisper CLI: $($whisper.FullName)"

  Title '4/4 Whisper speech model'
  $whisperModel=Join-Path $models 'ggml-small.bin'
  if(-not (Test-Path $whisperModel) -or (Get-Item $whisperModel).Length -lt 100MB){
    Note 'Downloading Whisper Small (~460 MB)...'
    Invoke-WebRequest -Uri 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin' -OutFile $whisperModel -UseBasicParsing
  }
  Good "Speech model: $whisperModel"

  $info=[ordered]@{version='2.0.0-win11';installedAt=(Get-Date).ToString('o');platform='win32';model=$model;visionModel=$model;ollamaPath=$ollama;ffmpegPath=$ffmpeg;whisperPath=$whisper.FullName;whisperModelPath=$whisperModel}
  $info | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $root 'local-engine.json') -Encoding UTF8

  Title 'READY'
  Good 'VIRAG FREE LOCAL AI IS READY ON WINDOWS 11'
  Write-Host "Brain: $model" -ForegroundColor White
  Write-Host 'Voice: local Whisper + Windows system speech' -ForegroundColor White
  Write-Host 'OpenAI API key: NOT REQUIRED' -ForegroundColor Green
  Write-Host "`nGo back to Virag -> Settings -> Re-check, then press Start Virag." -ForegroundColor Yellow
}
catch {
  Fail $_.Exception.Message
  Write-Host "`nIf this repeats, take a screenshot of this window and send it." -ForegroundColor Yellow
}
Read-Host "`nPress Enter to close"
