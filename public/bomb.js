// bomb.js - Lógica de bombas e explosões
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa } from './map.js';

export const TEMPO_BOMBA = 120; // Tempo em frames antes da explosão
export const TAMANHO_EXPLOSAO = 1; // Alcance da explosão (1 bloco para cada lado)
export const bombas = [];
export const explosoes = [];

export function plantarBomba(player) {
    const gridX = Math.floor(player.x / TAMANHO_BLOCO);
    const gridY = Math.floor(player.y / TAMANHO_BLOCO);

    const bombaExistente = bombas.some(b => b.gridX === gridX && b.gridY === gridY);
    if (bombaExistente) return;

    bombas.push({
        gridX: gridX,
        gridY: gridY,
        x: gridX * TAMANHO_BLOCO + TAMANHO_BLOCO / 2,
        y: gridY * TAMANHO_BLOCO + TAMANHO_BLOCO / 2,
        timer: TEMPO_BOMBA,
    });
}

function explodirBomba(bomba) {
    const areaExplosao = [
        { x: bomba.gridX, y: bomba.gridY },
        { x: bomba.gridX, y: bomba.gridY - 1 },
        { x: bomba.gridX, y: bomba.gridY + 1 },
        { x: bomba.gridX - 1, y: bomba.gridY },
        { x: bomba.gridX + 1, y: bomba.gridY },
    ];

    areaExplosao.forEach(pos => {
        if (pos.x >= 0 && pos.x < LARGURA_MAPA && pos.y >= 0 && pos.y < ALTURA_MAPA) {
            if (mapa[pos.y][pos.x] === 3) {
                mapa[pos.y][pos.x] = 0;
            }
            explosoes.push({
                x: pos.x * TAMANHO_BLOCO,
                y: pos.y * TAMANHO_BLOCO,
                timer: 20,
            });
        }
    });
}

export function atualizarBombas() {
    for (let i = bombas.length - 1; i >= 0; i--) {
        bombas[i].timer--;
        if (bombas[i].timer <= 0) {
            explodirBomba(bombas[i]);
            bombas.splice(i, 1);
        }
    }
}

export function atualizarExplosoes() {
    for (let i = explosoes.length - 1; i >= 0; i--) {
        explosoes[i].timer--;
        if (explosoes[i].timer <= 0) {
            explosoes.splice(i, 1);
        }
    }
}
