// Script to generate bcrypt password hashes
// Run this with: node generate-passwords.js

const bcrypt = require('bcryptjs');

async function generateHashes() {
  console.log('Generating password hashes...\n');
  
  const adminHash = await bcrypt.hash('admin123', 10);
  const conductorHash = await bcrypt.hash('conductor123', 10);
  
  console.log('=== COPY THESE HASHES TO DATABASE_MIGRATION.sql ===\n');
  console.log('Admin (admin123):');
  console.log(adminHash);
  console.log('\nConductor (conductor123):');
  console.log(conductorHash);
  console.log('\n=== SQL UPDATE STATEMENTS ===\n');
  console.log(`UPDATE users SET password_hash = '${adminHash}' WHERE email = 'admin@buspass.com';`);
  console.log(`\nINSERT INTO users (email, password_hash, role, full_name, phone) VALUES ('conductor@buspass.com', '${conductorHash}', 'conductor', 'Bus Conductor', '9876543211') ON DUPLICATE KEY UPDATE password_hash = '${conductorHash}', role = 'conductor';`);
}

generateHashes().catch(console.error);

