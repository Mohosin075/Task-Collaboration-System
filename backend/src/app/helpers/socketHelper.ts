import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-project', (projectId: string) => {
      socket.join(projectId);
      console.log(`👤 Client ${socket.id} joined project room: ${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
};

const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};

const emitToRoom = (room: string, event: string, data: any) => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

export const socketHelper = {
  initializeSocket,
  getIO,
  emitToAll,
  emitToRoom,
};
