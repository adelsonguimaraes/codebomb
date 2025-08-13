// player.js - Lógica do jogador e input
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa } from './map.js';
import { bombas } from './bomb.js';

export const VELOCIDADE_JOGADOR = 2; // Velocidade de movimento em pixels
export const players = [];
export const teclasPressionadas = {};

window.addEventListener('keydown', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = false;
});

// Função que checa a colisão com blocos do mapa e com bombas
function podeMover(x, y, player) {
    const mapaX = Math.floor(x / TAMANHO_BLOCO);
    const mapaY = Math.floor(y / TAMANHO_BLOCO);

    if (mapaX < 0 || mapaX >= LARGURA_MAPA || mapaY < 0 || mapaY >= ALTURA_MAPA) {
        return false;
    }

    if (mapa[mapaY][mapaX] === 1 || mapa[mapaY][mapaX] === 3) {
        return false;
    }

    // Verifica colisão com bombas, mas permite passar pela que foi plantada
    const temBomba = bombas.find(b => b.gridX === mapaX && b.gridY === mapaY);
    if (temBomba) {
        // Se a bomba foi plantada pelo jogador e ele ainda pode atravessá-la, permite o movimento
        if (temBomba.colocadorId === player.id && temBomba.podePassar) {
            return true;
        }
        return false;
    }

    return true;
}

export function moverJogador(player) {
    const playerTileX = Math.floor(player.x / TAMANHO_BLOCO);
    const playerTileY = Math.floor(player.y / TAMANHO_BLOCO);

    let novoX = player.x;
    let novoY = player.y;

    if (teclasPressionadas['arrowup'] || teclasPressionadas['w']) {
        novoY -= VELOCIDADE_JOGADOR;
    }
    if (teclasPressionadas['arrowdown'] || teclasPressionadas['s']) {
        novoY += VELOCIDADE_JOGADOR;
    }
    if (teclasPressionadas['arrowleft'] || teclasPressionadas['a']) {
        novoX -= VELOCIDADE_JOGADOR;
    }
    if (teclasPressionadas['arrowright'] || teclasPressionadas['d']) {
        novoX += VELOCIDADE_JOGADOR;
    }

    if (podeMover(novoX, novoY, player)) {
        // Atualiza a posição do jogador
        player.x = novoX;
        player.y = novoY;

        // Se o jogador saiu do bloco da bomba, a bomba se torna uma parede
        const novoTileX = Math.floor(player.x / TAMANHO_BLOCO);
        const novoTileY = Math.floor(player.y / TAMANHO_BLOCO);
        if (novoTileX !== playerTileX || novoTileY !== playerTileY) {
            const bomba = bombas.find(b => b.gridX === playerTileX && b.gridY === playerTileY && b.colocadorId === player.id);
            if (bomba) {
                bomba.podePassar = false;
            }
        }
    }
}
