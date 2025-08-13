const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

// Inicializa a lógica do Socket.IO
initSocket(io);

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});