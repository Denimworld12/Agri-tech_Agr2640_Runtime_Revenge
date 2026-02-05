# Clean Audio Files Script
# This will delete old audio files so new ones are generated fresh

Write-Host "`n🧹 Cleaning old audio files..." -ForegroundColor Cyan

$audioPath = ".\audios"  
$filesToKeep = @(".DS_Store")

Get-ChildItem -Path $audioPath | Where-Object { 
    $_.Name -notin $filesToKeep 
} | ForEach-Object {
    Write-Host "   Deleting: $($_.Name)" -ForegroundColor Yellow
    Remove-Item $_.FullName -Force
}

Write-Host "✅ Audio files cleaned!`n" -ForegroundColor Green
Write-Host "Now restart the chatbot server:`n" -ForegroundColor Cyan
Write-Host "   cd chatBot" -ForegroundColor Gray
Write-Host "   npm start`n" -ForegroundColor Gray
