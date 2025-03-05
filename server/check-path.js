const fs = require('fs');
const path = require('path');

console.log('Current working directory:', process.cwd());
console.log('\nFiles in current directory:');

try {
  const files = fs.readdirSync(process.cwd());
  files.forEach(file => {
    const stats = fs.statSync(path.join(process.cwd(), file));
    console.log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
  });
} catch (error) {
  console.error('Error reading directory:', error);
}

// Check for specific files we expect to exist
const expectedFiles = ['index.js', 'test-login-users.js', 'create-users.js'];
console.log('\nChecking for expected files:');
expectedFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`- ${file}: ${exists ? 'Found' : 'Not found'}`);
}); 