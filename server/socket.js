const game = require('./game');

// Função para inicializar o Socket.IO
function initSocket(io) {
    io.on('connection', (socket) => {
        console.log(`Novo jogador conectado: ${socket.id}`);

        // Quando um jogador se conecta, gera um mapa e envia para ele.
        const novoMapa = game.gerarMapa();
        socket.emit('mapaGerado', {
            mapa: novoMapa,
            largura: game.LARGURA,
            altura: game.ALTURA,
        });

        socket.on('disconnect', () => {
            console.log(`Jogador desconectado: ${socket.id}`);
        });
    });
}

module.exports = {
    initSocket,
};