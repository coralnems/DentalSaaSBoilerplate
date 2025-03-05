Write-Host "Starting development environment..." -ForegroundColor Cyan

# Kill existing Node.js processes
Write-Host "Killing existing Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe /FI "MEMUSAGE gt 1" 2>$null

# Wait a moment to ensure processes are terminated
Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Start the server and client processes
Write-Host "Starting server and client..." -ForegroundColor Green

# Start the server in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD\server; nodemon index.js"

# Wait a bit before starting the client
Start-Sleep -Seconds 3

# Start the client in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD\client; npm run dev"

Write-Host "Development environment started successfully" -ForegroundColor Green
Write-Host "NOTE: Check the new PowerShell windows for server and client output" -ForegroundColor Cyan 