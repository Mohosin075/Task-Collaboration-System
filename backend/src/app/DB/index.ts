import config from '../config/index.js';
import { User } from '../modules/user/user.model.js';

const seedAdmin = async () => {
  try {
    // 1. Seed Default Admin
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: config.admin_email,
        password: config.admin_password,
        role: 'Admin',
      });
      console.log('🛡️ Default admin user created successfully!');
    } else {
      console.log('🛡️ Admin user already exists. Skipping default admin creation.');
    }

    // 2. Seed Demo Users
    const roles: Array<{ name: string; email: string; role: 'Admin' | 'Project Manager' | 'Team Member' }> = [
      { name: 'Admin Demo', email: 'admin@demo.com', role: 'Admin' },
      { name: 'PM Demo', email: 'pm@demo.com', role: 'Project Manager' },
      { name: 'Member Demo 1', email: 'member1@demo.com', role: 'Team Member' },
      { name: 'Member Demo 2', email: 'member2@demo.com', role: 'Team Member' },
    ];

    for (const entry of roles) {
      const userExists = await User.findOne({ email: entry.email });
      if (!userExists) {
        await User.create({
          name: entry.name,
          email: entry.email,
          password: 'demo123456@Password',
          role: entry.role,
        });
        console.log(`👤 Demo user created: ${entry.name} (${entry.role})`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to seed default database:', error);
  }
};

export default seedAdmin;
