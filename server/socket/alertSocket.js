export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    
    socket.on('requestStatus', () => {
      // Send current status when client requests it
      socket.emit('statusUpdate', {
        timestamp: new Date().toISOString()
      });
    });
    
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
  
  console.log('📡 WebSocket server initialized');
};