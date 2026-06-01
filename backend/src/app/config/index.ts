import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 5000,
  mongo_uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-collaboration',
  jwt_secret: process.env.JWT_SECRET || 'super_secret_key_smart_collaboration_123456',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  node_env: process.env.NODE_ENV || 'development',
};
