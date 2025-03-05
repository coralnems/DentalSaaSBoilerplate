const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

function updateEnvironmentFile() {
    const envPath = path.join(__dirname, '../.env');
    const envExamplePath = path.join(__dirname, '../.env.example');
    
    // Generate new secrets
    const jwtSecret = generateSecureSecret();
    const jwtRefreshSecret = generateSecureSecret();
    const sessionSecret = generateSecureSecret();
    
    try {
        // Read existing .env file or .env.example if .env doesn't exist
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        } else if (fs.existsSync(envExamplePath)) {
            envContent = fs.readFileSync(envExamplePath, 'utf8');
        }

        // Update JWT_SECRET
        envContent = envContent.replace(
            /JWT_SECRET=.*/,
            `JWT_SECRET=${jwtSecret}`
        );

        // Update JWT_REFRESH_SECRET
        if (envContent.includes('JWT_REFRESH_SECRET=')) {
            envContent = envContent.replace(
                /JWT_REFRESH_SECRET=.*/,
                `JWT_REFRESH_SECRET=${jwtRefreshSecret}`
            );
        } else {
            // Add after JWT_SECRET if it doesn't exist
            envContent = envContent.replace(
                /(JWT_SECRET=.*)/,
                `$1\nJWT_REFRESH_SECRET=${jwtRefreshSecret}`
            );
        }

        // Update SESSION_SECRET
        envContent = envContent.replace(
            /SESSION_SECRET=.*/,
            `SESSION_SECRET=${sessionSecret}`
        );

        // Write updated content back to .env
        fs.writeFileSync(envPath, envContent);

        // Also update .env.example with the same structure (but with placeholder values)
        if (fs.existsSync(envExamplePath)) {
            let exampleContent = fs.readFileSync(envExamplePath, 'utf8');
            exampleContent = exampleContent.replace(
                /JWT_SECRET=.*/,
                'JWT_SECRET=your-jwt-secret-key'
            );
            
            if (exampleContent.includes('JWT_REFRESH_SECRET=')) {
                exampleContent = exampleContent.replace(
                    /JWT_REFRESH_SECRET=.*/,
                    'JWT_REFRESH_SECRET=your-jwt-refresh-secret-key'
                );
            } else {
                exampleContent = exampleContent.replace(
                    /(JWT_SECRET=.*)/,
                    '$1\nJWT_REFRESH_SECRET=your-jwt-refresh-secret-key'
                );
            }
            
            exampleContent = exampleContent.replace(
                /SESSION_SECRET=.*/,
                'SESSION_SECRET=your-session-secret-key'
            );
            
            fs.writeFileSync(envExamplePath, exampleContent);
        }

        console.log('✅ Successfully generated and updated secrets:');
        console.log('JWT_SECRET updated');
        console.log('JWT_REFRESH_SECRET updated');
        console.log('SESSION_SECRET updated');
        
        // Store the current secrets in a temporary file for backup
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(__dirname, `../storage/secrets-${timestamp}.json`);
        
        const secrets = {
            timestamp,
            jwtSecret,
            jwtRefreshSecret,
            sessionSecret
        };

        // Ensure storage directory exists
        const storageDir = path.join(__dirname, '../storage');
        if (!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir, { recursive: true });
        }

        fs.writeFileSync(backupPath, JSON.stringify(secrets, null, 2));
        console.log(`🔒 Backup of secrets saved to: ${backupPath}`);

    } catch (error) {
        console.error('❌ Error updating environment file:', error);
        process.exit(1);
    }
}

// Run the script
updateEnvironmentFile(); 