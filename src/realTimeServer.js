module.exports = (httpServer) => {
  const { Server } = require("socket.io");
  const io = new Server(httpServer);

  // Helper: extrae el nombre de usuario desde la cookie de la petición
  const getUserFromSocket = (socket) => {
    const cookie = socket.request.headers.cookie || "";
    return cookie.split("=").pop();
  };

  io.on("connection", (socket) => {
    // ── Evento existente: envío de mensajes ──────────────────────────────────
    socket.on("message", (message) => {
      const user = getUserFromSocket(socket);

      io.emit("message", {
        user,
        message,
        date: new Date().toLocaleTimeString(),
      });
    });

    // ── NUEVA FEATURE: Indicador "usuario escribiendo..." ────────────────────

    /**
     * Evento "typing": el cliente lo emite mientras el usuario teclea.
     * Usamos socket.broadcast para retransmitir SOLO a los demás clientes
     * conectados, evitando que el propio emisor reciba su notificación.
     */
    socket.on("typing", () => {
      const user = getUserFromSocket(socket);
      socket.broadcast.emit("typing", { user });
    });

    /**
     * Evento "stopTyping": el cliente lo emite cuando el usuario deja de teclear.
     * Igual que "typing", se retransmite únicamente a los demás clientes.
     */
    socket.on("stopTyping", () => {
      const user = getUserFromSocket(socket);
      socket.broadcast.emit("stopTyping", { user });
    });
  });
};
