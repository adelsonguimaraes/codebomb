// player.js - Lógica do jogador e input
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa } from './map.js';
import { bombas, plantarBomba } from './bomb.js';

export const VELOCIDADE_JOGADOR = 2; // Velocidade de movimento em pixels
export const players = [];
export const teclasPressionadas = {};

window.addEventListener('keydown', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = false;
});

// Função que checa a colisão com blocos do mapa
function podeMover(x, y) {
    const mapaX = Math.floor(x / TAMANHO_BLOCO);
    const mapaY = Math.floor(y / TAMANHO_BLOCO);

    if (mapaX < 0 || mapaX >= LARGURA_MAPA || mapaY < 0 || mapaY >= ALTURA_MAPA) {
        return false;
    }

    if (mapa[mapaY][mapaX] === 1 || mapa[mapaY][mapaX] === 3) {
        return false;
    }

    const temBomba = bombas.some(b => b.gridX === mapaX && b.gridY === mapaY);
    if (temBomba) {
        return false;
    }

    return true;
}

export function moverJogador(player) {
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
    if (teclasPressionadas[' ']) {
        plantarBomba(player);
    }

    if (podeMover(novoX, novoY)) {
        player.x = novoX;
        player.y = novoY;
    }
}
