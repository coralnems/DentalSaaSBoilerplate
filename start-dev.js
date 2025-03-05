const { spawn, execSync } = require('child_process');

console.log('🔄 Starting development environment...');

// Kill existing Node.js processes
console.log('🛑 Killing existing Node.js processes...');
try {
  execSync('taskkill /F /IM node.exe /FI "MEMUSAGE gt 1"', { stdio: 'inherit' });
} catch (error) {
  // It's okay if this fails (e.g., no processes to kill)
  console.log('ℹ️ No processes to kill or error killing processes (this is usually fine)');
}

// Give processes time to terminate
console.log('⏱️ Waiting for processes to terminate...');
setTimeout(() => {
  console.log('🚀 Starting backend server...');
  
  // Start backend server
  const serverProcess = spawn('cmd.exe', ['/c', 'cd server && nodemon index.js'], {
    shell: true,
    stdio: 'inherit'
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Error starting server:', error);
  });
  
  // Wait a bit before starting the client to ensure the server is up
  setTimeout(() => {
    console.log('🚀 Starting frontend client...');
    
    // Start frontend client
    const clientProcess = spawn('cmd.exe', ['/c', 'cd client && npm run dev'], {
      shell: true,
      stdio: 'inherit'
    });
    
    clientProcess.on('error', (error) => {
      console.error('❌ Error starting client:', error);
    });
    
  }, 3000);
}, 2000); 