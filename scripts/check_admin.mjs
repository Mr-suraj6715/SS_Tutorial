import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';

const db = new DatabaseSync('./server/data/sstutorial.db');
const admin = db.prepare("SELECT id, email, role, is_active, password_hash FROM users WHERE email = 'admin@sstutorial.com'").get();
console.log('Admin found:', admin ? 'YES' : 'NO');
if (!admin) { console.error('No admin user!'); db.close(); process.exit(1); }
console.log('  id:', admin.id, '| role:', admin.role, '| active:', admin.is_active, '| hash_len:', admin.password_hash?.length);

const passwords = ['Admin@123456', 'Admin@12345', 'admin123', 'Admin123'];
let anyMatch = false;
for (const pwd of passwords) {
  const v = await bcrypt.compare(pwd, admin.password_hash);
  console.log(' ', pwd, '->', v ? 'MATCH ✅' : 'no');
  if (v) anyMatch = true;
}

if (!anyMatch) {
  console.log('No match found — resetting admin password to Admin@123456');
  const newHash = await bcrypt.hash('Admin@123456', 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE email = 'admin@sstutorial.com'").run(newHash);
  console.log('Password reset done. Admin can now log in with: Admin@123456');
}

db.close();
