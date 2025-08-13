// player.js - Classe do jogador e input
import { LARGURA_MAPA, ALTURA_MAPA, TAMANHO_BLOCO, mapa, Block } from './map.js';
import { bombas, Bomb } from './bomb.js';

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
        this.velocidade = 2; // Agora é uma propriedade da instância
        this.maxBombas = 1;
        this.bombasAtivas = 0;
        this.explosionRadius = 1;
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
            novoY -= this.velocidade;
        }
        if (teclasPressionadas['arrowdown'] || teclasPressionadas['s']) {
            novoY += this.velocidade;
        }
        if (teclasPressionadas['arrowleft'] || teclasPressionadas['a']) {
            novoX -= this.velocidade;
        }
        if (teclasPressionadas['arrowright'] || teclasPressionadas['d']) {
            novoX += this.velocidade;
        }

        if (this.podeMover(novoX, novoY)) {
            this.x = novoX;
            this.y = novoY;

            const novoTileX = Math.floor(this.x / TAMANHO_BLOCO);
            const novoTileY = Math.floor(this.y / TAMANHO_BLOCO);
            if (novoTileX !== playerTileX || novoTileY !== playerTileY) {
                const bomba = bombas.find(b => b.gridX === playerTileX && b.gridY === playerTileY && b.playerRef.id === this.id);
                if (bomba) {
                    bomba.podePassar = false;
                }
            }
        }
    }

    aumentarRaioExplosao() {
        this.explosionRadius++;
    }

    aumentarVelocidade() {
        this.velocidade++;
    }

    // NOVO: Método para aumentar a quantidade máxima de bombas
    aumentarContadorBombas() {
        this.maxBombas += 1;
        console.log("Aumentou o contador de bombas para:" + this.maxBombas);
    }
}
