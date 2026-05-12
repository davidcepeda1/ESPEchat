const socket = io();

const send = document.querySelector("#send-message");
const allMessages = document.querySelector("#all-messages");
const messageInput = document.querySelector("#message");

// Referencia al contenedor del indicador de "escribiendo..."
const typingIndicator = document.querySelector("#typing-indicator");

// ── Envío de mensajes ────────────────────────────────────────────────────────
send.addEventListener("click", () => {
  socket.emit("message", messageInput.value);
  messageInput.value = "";

  // Al enviar, se cancela cualquier estado "escribiendo" pendiente
  clearTimeout(typingTimeout);
  socket.emit("stopTyping");
});

// También enviar con la tecla Enter para mejor UX
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send.click();
});

// ── Recepción de mensajes ────────────────────────────────────────────────────
socket.on("message", ({ user, message, date }) => {
  const msg = document.createRange().createContextualFragment(`
    <div class="message">
      <div class="image-container">
        <img src="/img/paulo.png" alt="" />
      </div>
      <div class="message-body">
        <div class="user-info">
          <span class="username">${user}</span>
          <span class="time">${date}</span>
          <p>${message}</p>
        </div>
      </div>
    </div>
  `);
  allMessages.append(msg);
  // Desplaza el chat hacia el último mensaje
  allMessages.scrollTop = allMessages.scrollHeight;
});

// ── NUEVA FEATURE: Indicador "usuario escribiendo..." ────────────────────────

/**
 * typingTimeout: temporizador para detectar cuándo el usuario dejó de escribir.
 * Si el usuario no pulsa ninguna tecla en 1.5 s, se emite "stopTyping".
 * Esto evita emitir "stopTyping" de inmediato ante cada pausa corta (debounce).
 */
let typingTimeout = null;
const TYPING_TIMER_MS = 1500; // tiempo de espera antes de considerar que dejó de escribir

messageInput.addEventListener("input", () => {
  // Emite "typing" cada vez que hay actividad en el campo de texto
  socket.emit("typing");

  // Reinicia el temporizador: si el usuario sigue tecleando, nunca se dispara
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping");
  }, TYPING_TIMER_MS);
});

// Escucha el evento "typing" del servidor (viene de OTROS clientes)
socket.on("typing", ({ user }) => {
  typingIndicator.textContent = `✏️ ${user} está escribiendo...`;
  typingIndicator.classList.add("visible");
});

// Escucha el evento "stopTyping" del servidor (viene de OTROS clientes)
socket.on("stopTyping", () => {
  typingIndicator.textContent = "";
  typingIndicator.classList.remove("visible");
});
