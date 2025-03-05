const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function checkSecretStrength(secret) {
    if (!secret || typeof secret !== 'string') return false;
    // Check if secret is at least 32 characters long and contains a mix of characters
    return secret.length >= 32 && 
           /[A-Z]/.test(secret) && 
           /[a-z]/.test(secret) && 
           /[0-9]/.test(secret);
}

function generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

function initializeSecrets() {
    const envPath = path.join(__dirname, '../.env');
    let envContent = '';
    let secretsNeedUpdate = false;

    // Read current .env file
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
        console.error('❌ Error reading .env file:', error);
        process.exit(1);
    }

    // Extract current secrets
    const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
    const jwtRefreshSecretMatch = envContent.match(/JWT_REFRESH_SECRET=(.+)/);
    const sessionSecretMatch = envContent.match(/SESSION_SECRET=(.+)/);

    const currentJwtSecret = jwtSecretMatch ? jwtSecretMatch[1] : null;
    const currentJwtRefreshSecret = jwtRefreshSecretMatch ? jwtRefreshSecretMatch[1] : null;
    const currentSessionSecret = sessionSecretMatch ? sessionSecretMatch[1] : null;

    // Check if secrets need to be updated
    if (!checkSecretStrength(currentJwtSecret)) {
        console.log('🔄 JWT_SECRET needs to be updated');
        secretsNeedUpdate = true;
    }

    if (!checkSecretStrength(currentJwtRefreshSecret)) {
        console.log('🔄 JWT_REFRESH_SECRET needs to be updated');
        secretsNeedUpdate = true;
    }

    if (!checkSecretStrength(currentSessionSecret)) {
        console.log('🔄 SESSION_SECRET needs to be updated');
        secretsNeedUpdate = true;
    }

    if (secretsNeedUpdate) {
        console.log('🔐 Generating new secure secrets...');
        
        // Generate new secrets
        const newJwtSecret = generateSecureSecret();
        const newJwtRefreshSecret = generateSecureSecret();
        const newSessionSecret = generateSecureSecret();

        // Update environment file
        envContent = envContent.replace(
            /JWT_SECRET=.*/,
            `JWT_SECRET=${newJwtSecret}`
        );

        // Update or add JWT_REFRESH_SECRET
        if (envContent.includes('JWT_REFRESH_SECRET=')) {
            envContent = envContent.replace(
                /JWT_REFRESH_SECRET=.*/,
                `JWT_REFRESH_SECRET=${newJwtRefreshSecret}`
            );
        } else {
            // Add after JWT_SECRET if it doesn't exist
            envContent = envContent.replace(
                /(JWT_SECRET=.*)/,
                `$1\nJWT_REFRESH_SECRET=${newJwtRefreshSecret}`
            );
        }

        envContent = envContent.replace(
            /SESSION_SECRET=.*/,
            `SESSION_SECRET=${newSessionSecret}`
        );

        try {
            fs.writeFileSync(envPath, envContent);
            console.log('✅ Secrets updated successfully');
            
            // Store backup of new secrets
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(__dirname, `../storage/secrets-${timestamp}.json`);
            
            // Ensure storage directory exists
            const storageDir = path.join(__dirname, '../storage');
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }

            const secrets = {
                timestamp,
                jwtSecret: newJwtSecret,
                jwtRefreshSecret: newJwtRefreshSecret,
                sessionSecret: newSessionSecret
            };

            fs.writeFileSync(backupPath, JSON.stringify(secrets, null, 2));
            console.log(`🔒 Backup of new secrets saved to: ${backupPath}`);
            
        } catch (error) {
            console.error('❌ Error updating secrets:', error);
            process.exit(1);
        }
    } else {
        console.log('✅ Existing secrets are strong and valid');
    }
}

// Export for use in server startup
module.exports = initializeSecrets;

// Run directly if called from command line
if (require.main === module) {
    initializeSecrets();
} 