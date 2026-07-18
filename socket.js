let io;

module.exports = {
  init: (socketIoInstance) => {
    io = socketIoInstance;
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};