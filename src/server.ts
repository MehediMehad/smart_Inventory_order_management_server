import type { Server as HttpServer } from 'http';


import app from './app';
import seedSuperAdmin from './app/helpers/db/seedSuperAdmin';
import { getLocalIP } from './app/helpers/devHelpers';
import config from './configs';
// import { initializeSocket } from './app/modules/chat/chat.socket';

let server: HttpServer;

async function main() {
  try {
    // 🟢 Start the server
    const port = config.app.port || 5000;
    server = app.listen(port, async () => {
      console.log(`🚀 Server is running on port ${port}`);
      await seedSuperAdmin(); // Seed Super Admin user on startup
      getLocalIP(); // 🖥️ Your PC's local IPv4 address(es)


      // Pass io to socket handler
      // initializeSocket(io);
    });

    // 🔐 Handle Uncaught Exceptions
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      shutdown();
    });

    // 🔐 Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Rejection:', reason);
      shutdown();
    });

    // 🛑 Graceful Shutdown
    process.on('SIGTERM', () => {
      console.info('🔁 SIGTERM received.');
      shutdown();
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// 🔁 Graceful Server Shutdown
function shutdown() {
  if (server) {
    server.close(() => {
      console.info('🔒 Server closed gracefully.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

main();
