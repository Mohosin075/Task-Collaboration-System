import { Server as HTTPServer } from 'http';
import mongoose from 'mongoose';
import app from './app.js';
import config from './app/config/index.js';
import { socketHelper } from './app/helpers/socketHelper.js';

let server: HTTPServer;

async function bootstrap() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(config.mongo_uri);
    console.log('🚀 MongoDB Connected Successfully!');

    // Initialize HTTP and Socket.IO servers
    server = new HTTPServer(app);
    socketHelper.initializeSocket(server);

    server.listen(config.port, () => {
      console.log(`📡 Server running on port: ${config.port} in ${config.node_env} mode`);
    });
  } catch (err) {
    console.error('❌ Database connection failed!', err);
    process.exit(1);
  }
}

// Global Exception and Rejection Handling
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception detected! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  if (server) {
    server.close(() => {
      console.log('🛑 Server gracefully closed. Exiting process...');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

bootstrap();
