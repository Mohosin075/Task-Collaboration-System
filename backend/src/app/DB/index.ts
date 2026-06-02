import config from '../config/index.js';
import { User } from '../modules/user/user.model.js';

const seedAdmin = async () => {
  try {
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
  } catch (error) {
    console.error('❌ Failed to seed default admin:', error);
  }
};

export default seedAdmin;
