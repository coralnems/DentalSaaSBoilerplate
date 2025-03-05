# Project Reorganization Script
# This script reorganizes the MERN boilerplate project structure
# to remove redundant folders and fix path references

Write-Host "Starting project reorganization..." -ForegroundColor Green

# Create backup of the project
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "../mern-boilerplate-backup-$timestamp"
Write-Host "Creating backup at $backupDir..." -ForegroundColor Cyan
Copy-Item -Path "." -Destination $backupDir -Recurse -Force
Write-Host "Backup created successfully." -ForegroundColor Green

# Step 1: Remove redundant folders
Write-Host "Removing redundant folders..." -ForegroundColor Cyan

# Check if app folder exists and is empty or nearly empty
if (Test-Path -Path "app") {
    $appFiles = Get-ChildItem -Path "app" -Recurse | Measure-Object
    if ($appFiles.Count -lt 5) {
        Remove-Item -Path "app" -Recurse -Force
        Write-Host "Removed empty 'app' folder" -ForegroundColor Yellow
    } else {
        Write-Host "Warning: 'app' folder contains files. Please review manually." -ForegroundColor Red
    }
}

# Check if client/server folder exists and remove it
if (Test-Path -Path "client/server") {
    Remove-Item -Path "client/server" -Recurse -Force
    Write-Host "Removed redundant 'client/server' folder" -ForegroundColor Yellow
}

# Check if server/server folder exists and remove it
if (Test-Path -Path "server/server") {
    # First, check if there's anything important in server/server/src
    if (Test-Path -Path "server/server/src") {
        # If server/src already exists, compare the two
        if (Test-Path -Path "server/src") {
            Write-Host "Both server/src and server/server/src exist. Checking for unique files..." -ForegroundColor Yellow
            
            # Create a temporary directory for comparison
            New-Item -Path "temp_comparison" -ItemType Directory -Force | Out-Null
            
            # Copy unique files from server/server/src to temp directory
            Get-ChildItem -Path "server/server/src" -Recurse | ForEach-Object {
                $relativePath = $_.FullName.Replace((Resolve-Path "server/server/src").Path + "\", "")
                $targetPath = Join-Path -Path "server/src" -ChildPath $relativePath
                
                if (-not (Test-Path -Path $targetPath)) {
                    $tempPath = Join-Path -Path "temp_comparison" -ChildPath $relativePath
                    $tempDir = Split-Path -Path $tempPath -Parent
                    
                    if (-not (Test-Path -Path $tempDir)) {
                        New-Item -Path $tempDir -ItemType Directory -Force | Out-Null
                    }
                    
                    Copy-Item -Path $_.FullName -Destination $tempPath -Force
                }
            }
            
            # Check if we found any unique files
            $uniqueFiles = Get-ChildItem -Path "temp_comparison" -Recurse | Measure-Object
            if ($uniqueFiles.Count -gt 0) {
                Write-Host "Found $($uniqueFiles.Count) unique files in server/server/src. Copying to server/src..." -ForegroundColor Yellow
                
                # Copy unique files to server/src
                Get-ChildItem -Path "temp_comparison" -Recurse | ForEach-Object {
                    $relativePath = $_.FullName.Replace((Resolve-Path "temp_comparison").Path + "\", "")
                    $targetPath = Join-Path -Path "server/src" -ChildPath $relativePath
                    $targetDir = Split-Path -Path $targetPath -Parent
                    
                    if (-not (Test-Path -Path $targetDir)) {
                        New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
                    }
                    
                    Copy-Item -Path $_.FullName -Destination $targetPath -Force
                }
            }
            
            # Clean up temp directory
            Remove-Item -Path "temp_comparison" -Recurse -Force
        } else {
            # If server/src doesn't exist, just move server/server/src to server/src
            Write-Host "Moving server/server/src to server/src..." -ForegroundColor Yellow
            Move-Item -Path "server/server/src" -Destination "server" -Force
        }
    }
    
    # Now remove the redundant server/server folder
    Remove-Item -Path "server/server" -Recurse -Force
    Write-Host "Removed redundant 'server/server' folder" -ForegroundColor Yellow
}

# Step 2: Ensure proper folder structure
Write-Host "Ensuring proper folder structure..." -ForegroundColor Cyan

# Make sure server/src exists
if (-not (Test-Path -Path "server/src")) {
    New-Item -Path "server/src" -ItemType Directory -Force | Out-Null
    Write-Host "Created 'server/src' folder" -ForegroundColor Yellow
}

# Make sure client/src exists
if (-not (Test-Path -Path "client/src")) {
    New-Item -Path "client/src" -ItemType Directory -Force | Out-Null
    Write-Host "Created 'client/src' folder" -ForegroundColor Yellow
}

# Step 3: Update .env files
Write-Host "Updating environment files..." -ForegroundColor Cyan

# Create or update root .env file
$rootEnvPath = ".env"
if (-not (Test-Path -Path $rootEnvPath)) {
    @"
# Main environment variables
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/dental-clinic
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
REDIS_URL=redis://localhost:6379
"@ | Out-File -FilePath $rootEnvPath -Encoding utf8
    Write-Host "Created root .env file with default values" -ForegroundColor Yellow
} else {
    $envContent = Get-Content -Path $rootEnvPath -Raw
    if (-not ($envContent -match "MONGO_URI")) {
        "MONGO_URI=mongodb://localhost:27017/dental-clinic" | Add-Content -Path $rootEnvPath
        Write-Host "Added MONGO_URI to root .env file" -ForegroundColor Yellow
    }
    if (-not ($envContent -match "REDIS_URL")) {
        "REDIS_URL=redis://localhost:6379" | Add-Content -Path $rootEnvPath
        Write-Host "Added REDIS_URL to root .env file" -ForegroundColor Yellow
    }
}

# Step 4: Update package.json files
Write-Host "Updating package.json files..." -ForegroundColor Cyan

# Update root package.json
$rootPackageJsonPath = "package.json"
if (Test-Path -Path $rootPackageJsonPath) {
    $packageJson = Get-Content -Path $rootPackageJsonPath -Raw | ConvertFrom-Json
    
    # Update scripts
    $packageJson.scripts.start = "node server/src/server.js"
    $packageJson.scripts.dev = "nodemon server/src/server.js"
    $packageJson.scripts.seed = "node server/src/utils/seeder.js"
    
    # Convert back to JSON and save
    $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath $rootPackageJsonPath -Encoding utf8
    Write-Host "Updated root package.json" -ForegroundColor Yellow
}

# Step 5: Fix the seeder.js file
Write-Host "Fixing seeder.js file..." -ForegroundColor Cyan

$seederPath = "server/src/utils/seeder.js"
if (Test-Path -Path $seederPath) {
    $seederContent = Get-Content -Path $seederPath -Raw
    
    # Fix the ES6 arrow function syntax if using CommonJS
    $seederContent = $seederContent -replace "const connectDB = async \(\) =>", "async function connectDB()"
    $seederContent = $seederContent -replace "const clearDatabase = async \(\) =>", "async function clearDatabase()"
    $seederContent = $seederContent -replace "const clearRedisCache = async \(\) =>", "async function clearRedisCache()"
    $seederContent = $seederContent -replace "const createUsers = async \(\) =>", "async function createUsers()"
    $seederContent = $seederContent -replace "const createPatients = async \(\) =>", "async function createPatients()"
    $seederContent = $seederContent -replace "const createTreatments = async \(\) =>", "async function createTreatments()"
    $seederContent = $seederContent -replace "const createAppointments = async \(users, patients, treatments\) =>", "async function createAppointments(users, patients, treatments)"
    $seederContent = $seederContent -replace "const seedDatabase = async \(\) =>", "async function seedDatabase()"
    
    # Save the updated content
    $seederContent | Out-File -FilePath $seederPath -Encoding utf8
    Write-Host "Fixed seeder.js file" -ForegroundColor Yellow
}

# Step 6: Create a README with the new structure
Write-Host "Creating README with new structure..." -ForegroundColor Cyan

$readmePath = "PROJECT-STRUCTURE.md"
@"
# Project Structure

This project has been reorganized to remove redundant folders and ensure a clean structure.

## Main Folders

- `client/` - Frontend React application
  - `client/src/` - React source code
  - `client/public/` - Static assets

- `server/` - Backend Express application
  - `server/src/` - Express source code
    - `server/src/controllers/` - API controllers
    - `server/src/middleware/` - Express middleware
    - `server/src/models/` - MongoDB models
    - `server/src/routes/` - API routes
    - `server/src/utils/` - Utility functions
    - `server/src/server.js` - Main server file

## Running the Application

- Start the server: `npm run server`
- Start the client: `npm run client`
- Start both: `npm run dev:all`
- Seed the database: `npm run seed`

## Environment Variables

Make sure to set up your environment variables in the `.env` file in the root directory.
Required variables:
- `MONGO_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string (if using Redis)
- `JWT_SECRET` - Secret for JWT tokens
"@ | Out-File -FilePath $readmePath -Encoding utf8

Write-Host "Project reorganization completed successfully!" -ForegroundColor Green
Write-Host "Please review the changes and check the PROJECT-STRUCTURE.md file for details." -ForegroundColor Green
Write-Host "A backup of your original project was created at: $backupDir" -ForegroundColor Green 