const notify = document.querySelector("#notification");
const message = document.querySelector("#message");
const button = document.querySelector("button");
const messageBar = document.querySelector("#message-bar");
const form = document.querySelector("#messageBox");

// eslint-disable-next-line
const socket = io();

function sendMessagge(e) {
  e.preventDefault();
  socket.emit("text-message", message.value);
  form.reset();
}

button.addEventListener("click", sendMessagge);

socket.on("chat-text-received", (data) => {
  notify.textContent = data;
  messageBar.style.height = "18vh";
});

socket.on("products-added", (data) => {
  console.dir(data);
  notify.textContent = `Produsul ${data.name} a fost adaugat`;
});
