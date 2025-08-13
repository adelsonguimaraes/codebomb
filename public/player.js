// player.js - Classe do jogador e input
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, Block } from './map.js';
import { bombas, Bomb } from './bomb.js'; // Importa a classe Bomb

export const VELOCIDADE_JOGADOR = 2; // Velocidade de movimento em pixels
export const teclasPressionadas = {};

window.addEventListener('keydown', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
    teclasPressionadas[e.key.toLowerCase()] = false;
});

export class Player {
    constructor(id, x, y) {
        this.id = id;
        this.x = x + TAMANHO_BLOCO / 2;
        this.y = y + TAMANHO_BLOCO / 2;
        this.tamanho = TAMANHO_BLOCO * 0.8;
        this.maxBombas = 1; // Variável que controla o máximo de bombas que o jogador pode ter
        this.bombasAtivas = 0; // Variável que conta as bombas ativas
        this.explosionRadius = 1; // Raio de explosão padrão
    }

    podeMover(x, y) {
        const mapaX = Math.floor(x / TAMANHO_BLOCO);
        const mapaY = Math.floor(y / TAMANHO_BLOCO);
        const playerGridX = Math.floor(this.x / TAMANHO_BLOCO);
        const playerGridY = Math.floor(this.y / TAMANHO_BLOCO);


        if (mapaX < 0 || mapaX >= LARGURA_MAPA || mapaY < 0 || mapaY >= ALTURA_MAPA) {
            return false;
        }

        const bloco = mapa[mapaY][mapaX];
        if (bloco instanceof Block && (bloco.type === 1 || bloco.type === 2 || bloco.type === 3)) {
            return false;
        }

        // CORREÇÃO: A colisão com bombas agora só é verificada se o jogador estiver se movendo para um NOVO bloco.
        // Isso permite que o jogador saia do bloco onde a bomba foi colocada.
        if (mapaX !== playerGridX || mapaY !== playerGridY) {
            const temBomba = bombas.find(b => b.gridX === mapaX && b.gridY === mapaY);
            if (temBomba) {
                return false;
            }
        }

        return true;
    }

    mover() {
        const playerTileX = Math.floor(this.x / TAMANHO_BLOCO);
        const playerTileY = Math.floor(this.y / TAMANHO_BLOCO);

        let novoX = this.x;
        let novoY = this.y;

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

        if (this.podeMover(novoX, novoY)) {
            this.x = novoX;
            this.y = novoY;

            const novoTileX = Math.floor(this.x / TAMANHO_BLOCO);
            const novoTileY = Math.floor(this.y / TAMANHO_BLOCO);
            if (novoTileX !== playerTileX || novoTileY !== playerTileY) {
                const bomba = bombas.find(b => b.gridX === playerTileX && b.gridY === playerTileY && b.playerRef.id === this.id);
                if (bomba) {
                    // Esta lógica agora funciona corretamente para definir podePassar como false,
                    // já que o jogador realmente se moveu para um novo bloco.
                    bomba.podePassar = false;
                }
            }
        }
    }

    aumentarRaioExplosao() {
        this.explosionRadius++;
    }
}
